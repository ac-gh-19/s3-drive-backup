import { drive_v3 } from "googleapis/build/src/apis/drive/v3";
import path from "node:path";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { DriveFile } from "../types/driveFile";

export async function getFileStream(
  driveClient: drive_v3.Drive,
  fileId: string,
): Promise<NodeJS.ReadableStream> {
  const file = await driveClient.files.get(
    {
      alt: "media",
      fileId,
    },
    { responseType: "stream" },
  );

  return file.data;
}

export async function saveStreamToDownloads(
  stream: NodeJS.ReadableStream,
  file: DriveFile,
) {
  const downloadsDir = path.join(
    process.env.HOME || process.cwd(),
    "Downloads",
  );
  const filePath = path.join(downloadsDir, file.name || "unknown");

  const writeStream = createWriteStream(filePath);

  try {
    await pipeline(stream, writeStream);
  } catch (error) {
    return "Error saving file: " + error;
  }

  return filePath;
}
