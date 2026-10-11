import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, json } from "./lib.mjs";

const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

export const handler = async (event) => {
  let body;
  try { body = JSON.parse(event.body ?? "{}"); } catch { return json(400, { error: "Invalid JSON" }); }
  const ext = TYPES[body.contentType];
  if (!ext) return json(400, { error: "Only JPEG, PNG or WebP photos are allowed" });

  const key = `uploads/${randomUUID()}.${ext}`;
  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: process.env.BUCKET, Key: key, ContentType: body.contentType }),
    { expiresIn: 300 },
  );
  return json(200, { uploadUrl, key });
};
