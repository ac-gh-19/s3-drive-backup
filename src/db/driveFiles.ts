import Database from "better-sqlite3";
import { RecordFile } from "../types/driveFile";

export function createDriveFileRepository(db: Database.Database) {
  const getStmt = db.prepare(
    `SELECT drive_id, md5Checksum, s3Key
     FROM drive_files
     WHERE drive_id = ?`,
  );

  const insertStmt = db.prepare(
    `INSERT INTO drive_files (drive_id, md5Checksum, s3Key)
     VALUES (?, ?, ?)`,
  );

  const updateStmt = db.prepare(
    `UPDATE drive_files
     SET md5Checksum = ?, s3Key = ?
     WHERE drive_id = ?`,
  );

  function get(driveId: string): RecordFile | null {
    const row = getStmt.get(driveId);
    return row ? (row as RecordFile) : null;
  }

  function insert(driveId: string, md5Checksum: string, s3Key: string): void {
    insertStmt.run(driveId, md5Checksum, s3Key);
  }

  function update(driveId: string, md5Checksum: string, s3Key: string): void {
    updateStmt.run(md5Checksum, s3Key, driveId);
  }

  return {
    get,
    insert,
    update,
  };
}
