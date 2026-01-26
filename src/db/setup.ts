import { db } from "./index";
import { prepareStatements } from "./driveFiles";

export function initializeDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS drive_files (
      drive_id TEXT PRIMARY KEY,
      md5Checksum TEXT NOT NULL,
      s3Key TEXT NOT NULL
    );
  `);
  prepareStatements();
}
