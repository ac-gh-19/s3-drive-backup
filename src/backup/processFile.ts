import { BackupAction } from "./decideAction";
import { DriveFile } from "../types/driveFile";
import { drive_v3 } from "googleapis";
import { computeS3Key } from "../utils/computeS3Key";
import { createDriveFileRepository } from "../db/driveFiles";
import { getFileStream } from "../drive/download";
import { uploadStream } from "../s3/upload";
import { S3 } from "@aws-sdk/client-s3";

export async function processFile(
  driveClient: drive_v3.Drive,
  s3Client: S3,
  driveFileRepo: ReturnType<typeof createDriveFileRepository>,
  file: DriveFile,
  action: BackupAction,
  parentName: string,
): Promise<boolean> {
  try {
    let stream: NodeJS.ReadableStream;
    switch (action) {
      case BackupAction.SKIP:
        console.log(`File already backed up, skipping: ${file.name}`);
        return true;
      case BackupAction.REUPLOAD:
        console.log(`File has changed, re-uploading: ${file.name}`);
        stream = await getFileStream(driveClient, file.id);
        await uploadStream(
          s3Client,
          stream,
          process.env.S3_BUCKET_NAME!,
          computeS3Key(file),
          file.mimeType!,
        );
        await driveFileRepo.update(
          file.id,
          file.md5Checksum!,
          computeS3Key(file),
        );
        return true;
      case BackupAction.UPLOAD:
        console.log(`Uploading new file: ${file.name}`);
        stream = await getFileStream(driveClient, file.id);
        await uploadStream(
          s3Client,
          stream,
          process.env.S3_BUCKET_NAME!,
          `${parentName}/${computeS3Key(file)}`,
          file.mimeType!,
        );
        await driveFileRepo.insert(
          file.id,
          file.md5Checksum!,
          computeS3Key(file),
        );
        return true;
    }
  } catch (error) {
    console.error(`Error processing file ${file.name}: ${error}`);
    return false;
  }
}
