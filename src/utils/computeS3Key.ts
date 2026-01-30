import { DriveFile } from "../types/driveFile";

export function computeS3Key(file: DriveFile): string {
  // The date-based folder structure caused issues with folder paths
  // in S3 as created_time is based on when file was uploaded to Drive
  // and not when the photo was taken by user. TODO: revisit later if needed
  return `${file.path}/${file.md5Checksum!}-${file.id}/${file.name}`;
}
