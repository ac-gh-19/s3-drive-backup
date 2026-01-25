import { Upload } from "@aws-sdk/lib-storage";
import type { Readable } from "node:stream";
import { S3 } from "@aws-sdk/client-s3";

export async function uploadStream(
  s3Client: S3,
  stream: NodeJS.ReadableStream,
  bucket: string,
  key: string,
  contentType?: string,
) {
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: stream,
      ContentType: contentType,
    },
  });

  await upload.done();
}
