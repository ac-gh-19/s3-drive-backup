import { validateFolderLink } from "./drive/folder.js";
import { initServices } from "./backup/initServices.js";
import { promptUser } from "./cli/prompt.js";
import { runBackup } from "./backup/runBackup.js";
import { db } from "./db/index.js";

async function main() {
  const { driveClient, s3Client, driveFileRepo } = await initServices(db);

  const userInput = await promptUser("Enter folder link (must be public): ");
  console.log("\n");
  const folder = await validateFolderLink(driveClient, userInput);
  if (!folder) {
    throw new Error("Invalid folder link provided");
  }

  await runBackup(driveClient, s3Client, driveFileRepo, folder);
}

main();
