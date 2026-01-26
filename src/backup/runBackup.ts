import { S3 } from "@aws-sdk/client-s3";
import { drive_v3 } from "googleapis";
import { DriveFile } from "../types/driveFile";
import { crawlFolder } from "../drive/folder";
import { decideAction } from "./decideAction";
import { printBackupSummary } from "./printBackupSummary";
import { getDriveFile } from "../db/driveFiles";
import { processFile } from "./processFile";
import { TEXT_DELIMITER } from "../utils/textDelimiter";
import dotenv from "dotenv";

dotenv.config();

const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const PAUSE = 1000;

export async function runBackup(
  driveClient: drive_v3.Drive,
  s3Client: S3,
  rootFolder: DriveFile,
): Promise<void> {
  console.log(
    `Starting backup for folder: ${rootFolder.name} - (${rootFolder.id})\n`,
  );
  await sleep(PAUSE);

  console.log("Getting list of image files to back up...\n");
  await sleep(PAUSE);

  let files: DriveFile[] = [];

  files = await crawlFolder(driveClient, rootFolder);
  console.log(TEXT_DELIMITER);
  console.log(`Starting backup of ${files.length} files...\n`);
  await sleep(PAUSE);

  const errorFiles: DriveFile[] = [];
  const successFiles: DriveFile[] = [];
  for (const file of files) {
    const existingRecord = await getDriveFile(file.id);
    const action = await decideAction(file, existingRecord);
    const result = await processFile(driveClient, s3Client, file, action);
    if (result) {
      successFiles.push(file);
    } else {
      errorFiles.push(file);
    }
  }

  await sleep(PAUSE);
  printBackupSummary(files, successFiles, errorFiles);
  return;
}
