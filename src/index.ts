import { getAuthClient } from "./auth/googleAuth.js";
import { getDriveClient } from "./drive/client.js";
import { validateFolderLink } from "./drive/folder.js";
import { crawlFolder } from "./drive/folder.js";
import { getFileStream } from "./drive/download.js";
import { saveStreamToDownloads } from "./drive/download.js";
import { DriveFile } from "./types/driveFile.js";
import { getS3Client } from "./s3/client.js";
import { uploadStream } from "./s3/upload.js";
import { initializeDB } from "./db/setup.js";
import readline from "readline";

async function main() {
  initializeDB();
  const driveClient = await getDriveClient();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let userInput = "";
  rl.question("Enter folder link (must be public): ", async (folderLink) => {
    userInput = folderLink;
    console.log("\n");

    const folder = await validateFolderLink(driveClient, userInput);

    if (!folder) {
      console.log("Invalid folder link provided");
      rl.close();
      return;
    }

    let files: DriveFile[] = [];

    const message = `Crawling folder: ${folder.name}`;
    console.log(message);
    console.log("-".repeat(message.length));
    files = await crawlFolder(driveClient, folder.id);
    console.log("-".repeat(message.length) + "\n");
    for (const file of files) {
      console.log(`Found file: `, console.log(file));
    }

    //     const errorFiles: DriveFile[] = [];
    //     let success = 0;
    //     for (const file of files) {
    //       try {
    //         const stream = await getFileStream(driveClient, file.id);
    //         const savedPath = await saveStreamToDownloads(stream, file);
    //         console.log(`File saved to: ${savedPath}\n`);
    //         success += 1;
    //       } catch (error) {
    //         console.log(`Error downloading file ${file.name}: ${error}`);
    //         errorFiles.push(file);
    //         continue;
    //       }
    //     }
    //     rl.close();
    //   });
    //     const s3Client = await getS3Client();
    //     for (const file of files) {
    //       console.log(`Uploading file: ${file.name}`);
    //       try {
    //         const stream = await getFileStream(driveClient, file.id);
    //         const uploadPath = `drive-backup/${file.name}`;
    //         await uploadStream(
    //           s3Client,
    //           stream,
    //           "ac-image-upload-dev",
    //           uploadPath,
    //           file.mimeType,
    //         );
    //         console.log(`File uploaded to S3 at: ${uploadPath}\n`);
    //         success += 1;
    //       } catch (error) {
    //         console.log(`Error uploading file ${file.name}: ${error}`);
    //         errorFiles.push(file);
    //         continue;
    //       }
    //     }
    //     console.log(
    //       `Upload complete. \n-----------------\n${success} files uploaded successfully.\n${errorFiles.length} files failed to upload.`,
    //     );
    //     rl.close();
  });
}

main();
