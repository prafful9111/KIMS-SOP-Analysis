import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

/**
 * Generates a presigned URL for a given S3 URL
 * @param s3Url The full S3 URL stored in the DB
 * @returns A presigned URL or the original URL if parsing fails or credentials missing
 */
export async function getPresignedAudioUrl(s3Url: string): Promise<string> {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.warn("AWS credentials missing. Returning original URL.");
        return s3Url;
    }

    try {
        const url = new URL(s3Url);
        let bucket = "";
        let key = "";

        // Handle format: https://bucket.s3.region.amazonaws.com/key
        if (url.hostname.includes(".s3.")) {
            bucket = url.hostname.split(".s3.")[0];
            key = url.pathname.substring(1); // Remove leading slash
        } 
        // Handle format: https://s3.region.amazonaws.com/bucket/key
        else if (url.hostname.startsWith("s3.")) {
            const parts = url.pathname.substring(1).split("/");
            bucket = parts[0];
            key = parts.slice(1).join("/");
        }
        else {
            return s3Url;
        }

        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });

        // URL expires in 1 hour (3600 seconds)
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        return presignedUrl;
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        return s3Url;
    }
}
