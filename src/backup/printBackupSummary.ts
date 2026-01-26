import { DriveFile } from "../types/driveFile";
import { TEXT_DELIMITER } from "../utils/textDelimiter";

export function printBackupSummary(
  files: DriveFile[],
  successFiles: DriveFile[],
  errorFiles: DriveFile[],
) {
  console.log(TEXT_DELIMITER);
  console.log("Backup Summary:");
  console.log(`- Total files processed: ${files.length}`);
  console.log(`- Successful backups: ${successFiles.length}`);
  console.log(`- Failed backups: ${errorFiles.length}`);

  if (errorFiles.length > 0) {
    console.log("\nFiles that failed to back up:");
    errorFiles.forEach((file) => {
      console.log(`- ${file.name} (ID: ${file.id})`);
    });
  }
  console.log("\nBackup process completed.\n");
}
