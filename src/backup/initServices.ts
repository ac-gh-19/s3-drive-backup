import { getDriveClient } from "../drive/client";
import { S3 } from "@aws-sdk/client-s3";
import { getS3Client } from "../s3/client";
import { initializeDB } from "../db/setup";
import { drive_v3 } from "googleapis/build/src/apis/drive/v3";

export async function initServices(): Promise<{
  driveClient: drive_v3.Drive;
  s3Client: S3;
}> {
  try {
    initializeDB();
    const driveClient = await getDriveClient();
    const s3Client = await getS3Client();
    return { driveClient, s3Client };
  } catch (error) {
    console.error("Error initializing services:", error);
    throw error;
  }
}
