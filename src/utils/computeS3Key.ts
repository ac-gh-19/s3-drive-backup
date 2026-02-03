import { DriveFile } from "../types/driveFile";
import { joinPath } from "./joinPath";

export function computeS3Key(dirPath: string, file: DriveFile): string {
  if (!file.md5Checksum) {
    throw new Error(
      `Cannot compute S3 key: file ${file.id} has no md5Checksum`,
    );
  }
  if (!file.name) {
    throw new Error(`Cannot compute S3 key: file ${file.id} has no name`);
  }

  const identity = `${file.name}_${file.md5Checksum}-${file.id}`;
  return joinPath(dirPath, identity);
}
