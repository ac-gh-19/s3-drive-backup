import { drive_v3 } from "googleapis/build/src/apis/drive/v3";

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
