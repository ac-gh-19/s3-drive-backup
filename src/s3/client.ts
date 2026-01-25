import { S3, ListBucketsCommand } from "@aws-sdk/client-s3";

export async function getS3Client(): Promise<S3> {
  return new S3({ region: "us-west-1" });
}

export async function listBuckets(s3Client: S3) {
  const input = {
    ContinuationToken: undefined,
    MaxDirectoryBuckets: 10,
  };

  const command = new ListBucketsCommand(input);
  const response = await s3Client.send(command);
  return response;
}
