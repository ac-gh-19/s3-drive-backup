export function extractFolderIdFromLink(folderLink: string): string | null {
  const marker = "/folders/";
  const idx = folderLink.indexOf(marker);

  if (idx === -1) return null;

  const after = folderLink.slice(idx + marker.length);

  const endIdx = after.indexOf("?");
  const folderId = endIdx === -1 ? after : after.slice(0, endIdx);

  if (!folderId) return null;

  return folderId;
}
