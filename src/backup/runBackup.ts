import { S3 } from "@aws-sdk/client-s3";
import { drive_v3 } from "googleapis";
import { DriveFile } from "../types/driveFile";
import { crawlFolder } from "../drive/folder";
import { decideAction } from "./decideAction";
import { printBackupSummary } from "./printBackupSummary";
import { processFile } from "./processFile";
import { TEXT_DELIMITER } from "../utils/textDelimiter";
import dotenv from "dotenv";
import { createDriveFileRepository } from "../db/driveFiles";

dotenv.config();

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const PAUSE = 1000;

// TODO: Currently doesn't handle nested folders in S3 properly
export async function runBackup(
  driveClient: drive_v3.Drive,
  s3Client: S3,
  driveFileRepo: ReturnType<typeof createDriveFileRepository>,
  rootFolder: DriveFile,
): Promise<void> {
  console.log(
    `Starting backup for folder: ${rootFolder.name} - (${rootFolder.id})\n`,
  );
  await sleep(PAUSE);

  console.log("Getting list of files to back up...\n");
  await sleep(PAUSE);

  let files: DriveFile[] = [];

  files = await crawlFolder(driveClient, rootFolder);
  console.log(TEXT_DELIMITER);
  console.log(`Starting backup of ${files.length} files...\n`);
  await sleep(PAUSE);

  const errorFiles: DriveFile[] = [];
  const successFiles: DriveFile[] = [];
  const startTime = Date.now();
  for (const file of files) {
    const existingRecord = await driveFileRepo.get(file.id);
    const action = await decideAction(file, existingRecord);
    const result = await processFile(
      driveClient,
      s3Client,
      file,
      action,
      rootFolder.name,
    );
    if (result) {
      successFiles.push(file);
    } else {
      errorFiles.push(file);
    }
  }

  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;

  await sleep(PAUSE);
  printBackupSummary(files, successFiles, errorFiles, duration);
  return;
}
