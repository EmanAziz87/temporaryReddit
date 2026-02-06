import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../util/s3client";

export const cleanUpOrphanedImages = async (uploadedImageKeys: string[]) => {
  if (uploadedImageKeys.length > 0) {
    await Promise.all(
      uploadedImageKeys.map((key) =>
        s3Client.send(
          new DeleteObjectCommand({
            Bucket: process.env["AWS_BUCKET_NAME"],
            Key: key,
          }),
        ),
      ),
    );
    console.log(`Cleaned up ${uploadedImageKeys.length} orphaned images`);
  }
};
