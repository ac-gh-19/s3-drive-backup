export type DriveFile = {
  id: string;
  name: string;
  path?: string;
  s3Key?: string;
  mimeType?: string;
  md5Checksum?: string;
  createdTime?: string;
  size?: string;
};

export type RecordFile = {
  driveId: string;
  md5Checksum: string;
  s3Key: string;
  createdTime: string;
};
