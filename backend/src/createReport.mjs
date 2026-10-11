import { randomUUID } from "node:crypto";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { db, json } from "./lib.mjs";

const SEVERITIES = ["ankle", "knee", "blocked"];

export const handler = async (event) => {
  let body;
  try { body = JSON.parse(event.body ?? "{}"); } catch { return json(400, { error: "Invalid JSON" }); }

  const { lat, lng, severity, note = "", photoKey } = body;
  if (typeof lat !== "number" || typeof lng !== "number" || lat < -90 || lat > 90 || lng < -180 || lng > 180)
    return json(400, { error: "lat and lng must be valid numbers" });
  if (!SEVERITIES.includes(severity)) return json(400, { error: "Invalid severity" });
  if (photoKey && !String(photoKey).startsWith("uploads/")) return json(400, { error: "Invalid photoKey" });

  const now = Date.now();
  const report = {
    id: randomUUID(), lat, lng, severity,
    note: String(note).slice(0, 200),
    photoKey: photoKey ?? null,
    createdAt: now,
    expiresAt: Math.floor(now / 1000) + Number(process.env.TTL_HOURS || 6) * 3600, // seconds, used by DynamoDB TTL
  };
  await db.send(new PutCommand({ TableName: process.env.TABLE, Item: report }));
  const { photoKey: _k, ...publicReport } = report;
  return json(201, { report: { ...publicReport, photoUrl: null } });
};
