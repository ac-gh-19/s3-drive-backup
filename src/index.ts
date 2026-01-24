import { getAuthClient } from "./auth/googleAuth.js";
import { getDriveClient } from "./drive/client.js";
import { validateFolderLink } from "./drive/folder.js";
import { crawlFolder } from "./drive/folder.js";
import { getFileStream } from "./drive/download.js";
import { saveStreamToDownloads } from "./drive/download.js";
import { DriveFile } from "./types/driveFile.js";
import readline from 'readline';

async function main() {
  const driveClient = await getDriveClient();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  let userInput = "";
  rl.question('Enter folder link (must be public): ', async (folderLink) => {
    userInput = folderLink;
    console.log('\n');

  const folder = await validateFolderLink(
    driveClient,
    userInput,
  );

  if (!folder) {
    console.log("Invalid folder link provided");
    rl.close();
    return;
  }

  let files: DriveFile[] = [];


    const message = `Crawling folder: ${folder.name}`;
    console.log(message);
    console.log('-'.repeat(message.length));
    files = await crawlFolder(driveClient, folder.id);
    console.log('-'.repeat(message.length) + '\n');

  const errorFiles: DriveFile[] = [];
  let success = 0;
  for (const file of files) {
    console.log(`Downloading file: ${file.name}`);
    try {
        const stream = await getFileStream(driveClient, file.id);
        const savedPath = await saveStreamToDownloads(stream, file);
        console.log(`File saved to: ${savedPath}\n`);
        success += 1;
    } catch (error) {
        console.log(`Error downloading file ${file.name}: ${error}`);
        errorFiles.push(file);
        continue;
    }
  }
    console.log(`Download complete. \n-----------------\n${success} files downloaded successfully.\n${errorFiles.length} files failed to download.`);
      rl.close();
  });
}

main();
