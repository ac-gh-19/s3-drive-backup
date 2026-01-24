import { S3 } from "@aws-sdk/client-s3";

export async function uploadText(s3Client: S3) {
    try {
    await s3Client.putObject({
        Bucket: "ac-image-upload-dev",
        Key: "test-upload.txt",
        Body: "hello from node",
        ContentType: "text/plain",
    });
} catch (error) {
    console.error("Error uploading text:", error);
    return;
}
    console.log(`Uploaded text to s3://ac-image-upload-dev/test-upload.txt`);
}