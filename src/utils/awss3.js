import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import "dotenv";
import crypto from "crypto";


export const s3Client = new S3Client({
    region: "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

export const uploadToS3 = async (file) => {
    const fileExtension = file.originalname.split(".").pop();
    const fileKey = `apartments/${crypto.randomBytes(16).toString("hex")}.${fileExtension}`;

    await s3Client.send(new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: "public-read"
    }));

    return `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${fileKey}`
}


export const uploadAgentProfileProfile = async (file) => {
    const fileExt = file.originalname.split(".").pop();
    const fileKey = `agents/${crypto.randomBytes(16).toString("hex")}.${fileExt}`;

    await s3Client.send(new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype
    }));

    return `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${fileKey}`;
}