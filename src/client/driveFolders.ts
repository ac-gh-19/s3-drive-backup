import { extractFolderIdFromLink } from "../utils/folderLink";
import { drive_v3 } from "googleapis/build/src/apis/drive/v3";

export async function getFolderFromLink(
  driveClient: drive_v3.Drive,
  folderLink: string,
): Promise<{ id: string; name: string } | null> {
  const folderId = extractFolderIdFromLink(folderLink);
  if (!folderId) return null;

  try {
    const res = await driveClient.files.get({
      fileId: folderId,
      fields: "id, name, mimeType",
      supportsAllDrives: true,
    });

    const data = res.data;

    if (
      data.mimeType !== "application/vnd.google-apps.folder" ||
      !data.id ||
      !data.name
    ) {
      return null;
    }

    return { id: data.id, name: data.name };
  } catch (error) {
    return null;
  }
}
