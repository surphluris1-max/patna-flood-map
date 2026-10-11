import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db, s3, json } from "./lib.mjs";

// Scan is fine at hackathon scale. Switch to a Query with an index if this grows.
export const handler = async () => {
  const now = Math.floor(Date.now() / 1000);
  const out = await db.send(new ScanCommand({
    TableName: process.env.TABLE,
    FilterExpression: "expiresAt > :now",
    ExpressionAttributeValues: { ":now": now },
  }));
  const reports = await Promise.all((out.Items ?? []).map(async ({ photoKey, ...r }) => ({
    ...r,
    photoUrl: photoKey
      ? await getSignedUrl(s3, new GetObjectCommand({ Bucket: process.env.BUCKET, Key: photoKey }), { expiresIn: 3600 })
      : null,
  })));
  return json(200, { reports });
};
