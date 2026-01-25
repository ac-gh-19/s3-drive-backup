import { S3, ListBucketsCommand } from "@aws-sdk/client-s3";

export async function getS3Client(): Promise<S3> {
  return new S3({ region: "us-west-1" });
}
