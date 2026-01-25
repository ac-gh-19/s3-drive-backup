export type DriveFile = {
  id: string;
  name: string;
  mimeType?: string;
  md5Checksum?: string;
  createdTime?: string;
  size?: string;
};

export type StoredDriveFile = {
  driveId: string;
  md5Checksum: string;
  s3Key: string;
  createdTime: string;
};
