import { DriveFile } from "../types/driveFile";
import { RecordFile } from "../types/driveFile";

export enum BackupAction {
  SKIP = "SKIP",
  REUPLOAD = "REUPLOAD",
  UPLOAD = "UPLOAD",
}

export function decideAction(
  file: DriveFile,
  existingRecord: RecordFile,
): BackupAction {
  if (existingRecord) {
    if (existingRecord.md5Checksum === file.md5Checksum) {
      return BackupAction.SKIP;
    } else {
      return BackupAction.REUPLOAD;
    }
  }
  return BackupAction.UPLOAD;
}
