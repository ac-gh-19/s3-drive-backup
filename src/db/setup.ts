import Database from "better-sqlite3";

export function initializeDB(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS drive_files (
      drive_id TEXT PRIMARY KEY,
      md5Checksum TEXT NOT NULL,
      s3Key TEXT NOT NULL
    );
  `);
}
