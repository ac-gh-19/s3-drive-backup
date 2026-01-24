import { drive } from "googleapis/build/src/apis/drive";
import { extractFolderIdFromLink } from "../utils/folderLink";
import { drive_v3 } from "googleapis/build/src/apis/drive/v3";
import { DriveFile } from "../types/driveFile";

export async function validateFolderLink(
  driveClient: drive_v3.Drive,
  folderLink: string,
): Promise<DriveFile | null> {
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

export async function getFolderChildren(
  driveClient: drive_v3.Drive,
  folderId: string,
): Promise<DriveFile[]> {
  const files: DriveFile[] = [];
  let pageToken: string | undefined = undefined;

  try {
    do {
      const res: any = await driveClient.files.list({
        // only want images or folders that could possibly contain more images
        q: `'${folderId}' in parents and trashed = false and (mimeType contains 'image/' or mimeType = 'application/vnd.google-apps.folder')`,
        fields:
          "nextPageToken, files(id, name, mimeType, size, createdTime, md5Checksum)",
        supportsAllDrives: true,
        pageToken: pageToken,
      });

      files.push(...res.data.files);
      pageToken = res.data.nextPageToken;
    } while (pageToken);
  } catch (error) {
    throw new Error(
      `Failed to list children of folder ID ${folderId}: ${error}`,
    );
  }
  return files;
}

export async function crawlFolder(
  driveClient: drive_v3.Drive,
  folderId: string,
): Promise<DriveFile[]> {
  const files: Map<string, DriveFile> = new Map();
  const visitedFolderIds = new Set<string>();
  const queue = [folderId];

  while (queue.length > 0) {
    const currentFolderId = queue.shift()!;
    if (visitedFolderIds.has(currentFolderId)) {
      continue;
    }
    visitedFolderIds.add(currentFolderId);

    const filesInCurrFolder = await getFolderChildren(
      driveClient,
      currentFolderId,
    );

    for (const file of filesInCurrFolder) {
      if (file.mimeType === "application/vnd.google-apps.folder") {
        queue.push(file.id);
      } else {
        if (!files.has(file.md5Checksum!)) {
          files.set(file.md5Checksum!, file);
          console.log("Found file: ", file.name);
        }
      }
    }
  }

  return Array.from(files.values());
}
