import { DriveFile } from "../types/driveFile";

export function computeS3Key(file: DriveFile): string {
  const splitDate = file.createdTime!.split("-");

  const date = `${splitDate[0]}/${splitDate[1]}/${splitDate[2].slice(0, 2)}`;
  return `${date}/${file.md5Checksum!}/${file.id}/${file.name}`;
}
