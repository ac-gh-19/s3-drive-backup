import { drive } from "googleapis/build/src/apis/drive";
import { extractFolderIdFromLink } from "../utils/folderLink";
import { drive_v3 } from "googleapis/build/src/apis/drive/v3";
import { DriveFile } from "../types/driveFile";
import { computeS3Key } from "../utils/computeS3Key";
import { compute } from "googleapis/build/src/apis/compute";
import { joinPath } from "../utils/joinPath";

const INDENT_SPACE = "     ";

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
  folder: DriveFile,
): Promise<DriveFile[]> {
  const files: DriveFile[] = [];
  let pageToken: string | undefined = undefined;

  try {
    do {
      const res: any = await driveClient.files.list({
        // only want images or folders that could possibly contain more images
        q: `'${folder.id}' in parents and trashed = false and (mimeType contains 'image/' or mimeType = 'application/vnd.google-apps.folder')`,
        fields:
          "nextPageToken, files(id, name, mimeType, size, createdTime, md5Checksum)",
        supportsAllDrives: true,
        pageToken: pageToken,
      });

      const children: DriveFile[] = res.data.files;
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
  rootFolder: DriveFile,
): Promise<DriveFile[]> {
  const files = new Map<string, DriveFile>();
  const visitedFolderIds = new Set<string>();

  const queue: Array<{
    id: string;
    name: string;
    depth: number;
    path: string;
  }> = [
    {
      id: rootFolder.id,
      name: rootFolder.name,
      depth: 0,
      path: `${rootFolder.name}/`,
    },
  ];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visitedFolderIds.has(current.id)) continue;
    visitedFolderIds.add(current.id);

    console.log(`${INDENT_SPACE.repeat(current.depth)}/${current.name}`);

    const children = await getFolderChildren(driveClient, current);

    for (const child of children) {
      if (child.mimeType === "application/vnd.google-apps.folder") {
        queue.push({
          id: child.id,
          name: child.name,
          depth: current.depth + 1,
          path: joinPath(current.path, child.name, true),
        });
      } else if (child.md5Checksum) {
        const filePath = joinPath(current.path, child.name);

        if (!files.has(child.md5Checksum)) {
          const fileWithPath: DriveFile = {
            ...child,
            path: filePath,
          };

          files.set(child.md5Checksum, {
            ...fileWithPath,
            s3Key: computeS3Key(fileWithPath),
          });

          console.log(
            `${INDENT_SPACE.repeat(current.depth)}${INDENT_SPACE}- ${child.name}`,
          );
        }
      }
    }
  }

  return Array.from(files.values());
}
