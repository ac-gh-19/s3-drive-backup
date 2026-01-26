import { DriveFile } from "../types/driveFile";

export function computeS3Key(file: DriveFile): string {
  //   const splitDate = file.createdTime!.split("-");

  //   const date = `${splitDate[0]}/${splitDate[1]}/${splitDate[2].slice(0, 2)}`;
  //   return `${date}/${file.md5Checksum!}/${file.id}/${file.name}`;

  // The date-based folder structure caused issues with folder paths
  // in S3 as created_time is based on when file was uploaded to Drive
  // and not when the photo was taken by user. TODO: revisit later if needed
  return `${file.md5Checksum!}-${file.id}/${file.name}`;
}
