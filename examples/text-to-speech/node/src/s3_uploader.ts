import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";
import * as dotenv from "dotenv";

dotenv.config();

const {
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  AWS_REGION_NAME,
  AWS_S3_BUCKET_NAME,
} = process.env;

if (
  !AWS_ACCESS_KEY_ID ||
  !AWS_SECRET_ACCESS_KEY ||
  !AWS_REGION_NAME ||
  !AWS_S3_BUCKET_NAME
) {
  throw new Error(
    "One or more environment variables are not set. Please check your .env file."
  );
}

const s3 = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
  region: AWS_REGION_NAME,
});

export const generatePresignedUrl = async (objectKey: string) => {
  const getObjectParams = {
    Bucket: AWS_S3_BUCKET_NAME,
    Key: objectKey,
    Expires: 3600,
  };
  const command = new GetObjectCommand(getObjectParams);
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return url;
};

export const uploadAudioStreamToS3 = async (audioStream: Buffer) => {
  const remotePath = `${uuid()}.mp3`;
  await s3.send(
    new PutObjectCommand({
      Bucket: AWS_S3_BUCKET_NAME,
      Key: remotePath,
      Body: audioStream,
      ContentType: "audio/mpeg",
    })
  );
  return remotePath;
};
