import { getAuthClient } from "./auth/googleAuth.js";
import { getDriveClient } from "./drive/client.js";
import { validateFolderLink } from "./drive/folder.js";
import { crawlFolder } from "./drive/folder.js";

async function main() {
  const driveClient = await getDriveClient();
  const folder = await validateFolderLink(
    driveClient,
    "https://drive.google.com/drive/folders/12j_6FqV6rMsHoSm2N4fnbDxVgtCGpuOw?usp=sharing",
  );
  if (!folder) {
    console.log("Folder not found or invalid folder link.");
  } else {
    console.log("folder:", folder);
    const files = await crawlFolder(driveClient, folder.id);
    console.log("files:", files);
  }
}

main();
