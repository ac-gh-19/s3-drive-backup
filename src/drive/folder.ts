import { extractFolderIdFromLink } from "../utils/folderLink";
import { drive_v3 } from "googleapis/build/src/apis/drive/v3";
import { DriveFile } from "../types/driveFile";
import { computeS3Key } from "../utils/computeS3Key";
import { joinPath } from "../utils/joinPath";

type FolderQueueItem = {
  id: string;
  name: string;
  depth: number;
  dirPath: string;
};

const INDENT_SPACE = "     ";
const FOLDER_MIME = "application/vnd.google-apps.folder";

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

    if (data.mimeType !== FOLDER_MIME || !data.id || !data.name) {
      return null;
    }

    return { id: data.id, name: data.name, mimeType: data.mimeType };
  } catch {
    return null;
  }
}

export async function getFolderChildren(
  driveClient: drive_v3.Drive,
  folder: Pick<DriveFile, "id">,
): Promise<DriveFile[]> {
  const files: DriveFile[] = [];
  let pageToken: string | undefined = undefined;
  const q =
    `'${folder.id}' in parents and trashed = false and (` +
    `mimeType contains 'image/' or mimeType = '${FOLDER_MIME}'` +
    `)`;
  try {
    do {
      const res: any = await driveClient.files.list({
        // only want images or folders that could possibly contain more images
        q: q,
        fields:
          "nextPageToken, files(id, name, mimeType, size, createdTime, md5Checksum)",
        supportsAllDrives: true,
        pageToken: pageToken,
      });

      const children: DriveFile[] = res.data.files ?? [];
      files.push(...children);
      pageToken = res.data.nextPageToken;
    } while (pageToken);
  } catch (error) {
    throw new Error(
      `Failed to list children of folder ID ${folder.id}: ${error}`,
    );
  }
  return files;
}

export async function crawlFolder(
  driveClient: drive_v3.Drive,
  rootFolder: Pick<DriveFile, "id" | "name">,
): Promise<Array<DriveFile & { dirPath: string; s3Key: string }>> {
  const filesById = new Map<
    string,
    DriveFile & { dirPath: string; s3Key: string }
  >();
  const visitedFolderIds = new Set<string>();

  const rootDirPath = rootFolder.name;
  const queue: FolderQueueItem[] = [
    {
      id: rootFolder.id,
      name: rootFolder.name,
      depth: 0,
      dirPath: rootDirPath,
    },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visitedFolderIds.has(current.id)) continue;
    visitedFolderIds.add(current.id);

    console.log(`${INDENT_SPACE.repeat(current.depth)}/${current.name}`);

    const children = await getFolderChildren(driveClient, { id: current.id });

    for (const child of children) {
      if (!child.id || !child.name || !child.mimeType) continue;

      if (child.mimeType === FOLDER_MIME) {
        queue.push({
          id: child.id,
          name: child.name,
          depth: current.depth + 1,
          dirPath: joinPath(current.dirPath, child.name),
        });
        continue;
      }

      if (!child.md5Checksum) continue;

      if (filesById.has(child.id)) continue;

      const s3Key = computeS3Key(current.dirPath, child);

      filesById.set(child.id, {
        ...child,
        dirPath: current.dirPath,
        s3Key,
      });

      console.log(
        `${INDENT_SPACE.repeat(current.depth)}${INDENT_SPACE}- ${child.name}`,
      );
    }
  }

  return Array.from(filesById.values());
}
