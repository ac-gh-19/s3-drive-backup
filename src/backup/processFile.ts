import { BackupAction } from "./decideAction";
import { DriveFile } from "../types/driveFile";
import { drive_v3 } from "googleapis";
import { createDriveFileRepository } from "../db/driveFiles";
import { getFileStream } from "../drive/download";
import { uploadStream } from "../s3/upload";
import { S3 } from "@aws-sdk/client-s3";

type BackupFile = DriveFile & {
  s3Key: string;
  md5Checksum: string;
  mimeType: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export async function processFile(
  driveClient: drive_v3.Drive,
  s3Client: S3,
  driveFileRepo: ReturnType<typeof createDriveFileRepository>,
  file: BackupFile,
  action: BackupAction,
): Promise<boolean> {
  try {
    if (action === BackupAction.SKIP) {
      console.log(`File already backed up, skipping: ${file.name}`);
      return true;
    }

    const bucket = requireEnv("S3_BUCKET_NAME");
    const key = file.s3Key;

    if (action === BackupAction.REUPLOAD) {
      console.log(`File has changed, re-uploading: ${file.name}`);
    } else {
      console.log(`Uploading new file: ${file.name}`);
    }

    const stream = await getFileStream(driveClient, file.id);

    await uploadStream(s3Client, stream, bucket, key, file.mimeType);

    if (action === BackupAction.REUPLOAD) {
      await driveFileRepo.update(file.id, file.md5Checksum, key);
    } else {
      await driveFileRepo.insert(file.id, file.md5Checksum, key);
    }

    return true;
  } catch (error) {
    console.error(`Error processing file ${file.name}: ${String(error)}`);
    return false;
  }
}
