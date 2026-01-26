import { RecordFile } from "../types/driveFile";
import { db } from "./index";
import Database from "better-sqlite3";

let getByDriveIDStmt: Database.Statement | null = null;
let insertFileStmt: Database.Statement | null = null;
let updateFileStmt: Database.Statement | null = null;

export function prepareStatements() {
  if (!getByDriveIDStmt) {
    getByDriveIDStmt = db.prepare(
      `SELECT * FROM drive_files WHERE drive_id = ?`,
    );

    insertFileStmt = db.prepare(
      `INSERT INTO drive_files (drive_id, md5Checksum, s3Key)
       VALUES (?, ?, ?)`,
    );

    updateFileStmt = db.prepare(
      `UPDATE drive_files
       SET md5Checksum = ?, s3Key = ?
       WHERE drive_id = ?`,
    );
  }
}

export function getDriveFile(driveID: string): RecordFile {
  const row = getByDriveIDStmt!.get(driveID);
  return row as RecordFile;
}

export function insertDriveFile(
  driveID: string,
  md5Checksum: string,
  s3Key: string,
) {
  insertFileStmt!.run(driveID, md5Checksum, s3Key);
}

export function updateDriveFile(
  driveId: string,
  md5Checksum: string,
  s3Key: string,
) {
  updateFileStmt!.run(md5Checksum, s3Key, driveId);
}
