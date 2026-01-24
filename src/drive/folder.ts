import { drive } from "googleapis/build/src/apis/drive";
import { extractFolderIdFromLink } from "../utils/folderLink";
import { drive_v3 } from "googleapis/build/src/apis/drive/v3";

export async function validateFolderLink(
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

export async function getFolderChildren(
  driveClient: drive_v3.Drive,
  folderId: string,
) {
  const files = [];
  let pageToken: string | undefined = undefined;

  try {
    do {
      const res: any = await driveClient.files.list({
        q: `'${folderId}' in parents and trashed = false`,
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
) {
  const files: any[] = [];
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
        files.push(file);
      }
    }
  }

  return files;
}
