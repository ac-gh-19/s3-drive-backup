import { StoredDriveFile } from "../types/driveFile";
import { db } from "./index";

const getByDriveID = db.prepare(`SELECT * FROM drive_files WHERE drive_id = ?`);

const insertFile = db.prepare(
  `INSERT INTO drive_files (drive_id, md5Checksum, s3Key, created_time) VALUES (?, ?, ?, ?)`,
);

const updateFile = db.prepare(
  `UPDATE drive_files SET md5Checksum = ?, s3Key = ?, created_time = ? WHERE drive_id = ?`,
);

export function getDriveFile(driveID: string): StoredDriveFile {
  const row = getByDriveID.get(driveID);
  return row as StoredDriveFile;
}

export function insertDriveFile(row: StoredDriveFile) {
  insertFile.run(row.driveId, row.md5Checksum, row.s3Key, row.createdTime);
}

export function updateDriveFile(
  driveId: string,
  md5Checksum: string,
  s3Key: string,
  createdTime: string,
) {
  updateFile.run(md5Checksum, s3Key, createdTime, driveId);
}
