import dotenv from "dotenv";
dotenv.config();
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { pipeline } from "stream/promises";
import fs from "fs"

const s3 = new S3Client({
  region: process.env.B2_REGION,
  endpoint: process.env.B2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
   requestChecksumCalculation: "WHEN_REQUIRED", 
  responseChecksumValidation: "WHEN_REQUIRED",  
   maxAttempts: 5,
});

export async function generateUploadUrl(key, contentType) {
  const command = new PutObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  console.log("  Generated URL:", url);
  return url;
}

export async function generatePlaybackUrl(key) {
  const command = new GetObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME,
    Key: key,
  });
  return await getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function downloadFile(key, localPath) {
  const command = new GetObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME,
    Key: key
  })

  const response = await s3.send(command)
  await pipeline(response.Body, fs.createWriteStream(localPath))
}

export async function uploadFile(key, fileBufferOrPath, contentType) {
  const body = Buffer.isBuffer(fileBufferOrPath)
    ? fileBufferOrPath
    : fs.createReadStream(fileBufferOrPath);

  const command = new PutObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  await s3.send(command);
}

export async function getFileStream(key) {
  const command = new GetObjectCommand({
    Bucket: process.env.B2_BUCKET_NAME,
    Key: key,
  });
  const response = await s3.send(command);
  return response; // response.Body stream hai, response.ContentType bhi milega
}