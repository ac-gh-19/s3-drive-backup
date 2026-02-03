import { getDriveClient } from "../drive/client";
import { S3 } from "@aws-sdk/client-s3";
import { getS3Client } from "../s3/client";
import { drive_v3 } from "googleapis/build/src/apis/drive/v3";
import { createDriveFileRepository } from "../db/driveFiles";
import Database from "better-sqlite3";
import { initializeDB } from "../db/setup";

export async function initServices(db: Database.Database): Promise<{
  driveClient: drive_v3.Drive;
  s3Client: S3;
  driveFileRepo: ReturnType<typeof createDriveFileRepository>;
}> {
  try {
    initializeDB(db);
    const driveFileRepo = createDriveFileRepository(db);
    const driveClient = await getDriveClient();
    const s3Client = await getS3Client();
    return { driveClient, s3Client, driveFileRepo };
  } catch (error) {
    throw error;
  }
}
