import { getAuthClient } from "./auth/googleAuth.js";
import { getDriveClient } from "./client/driveClient.js";
import { getFolderFromLink } from "./client/driveFolders.js";

async function main() {
  const driveClient = await getDriveClient();
  const folder = await getFolderFromLink(
    driveClient,
    "https://drive.google.com/drive/folders/12nrQzf_-89SP-JJ8-gfn-8JqfcOCUCdF?usp=drive_link",
  );
  if (!folder) {
    console.log("Folder not found or invalid folder link.");
  } else {
    console.log("folder:", folder);
  }
}

main();
