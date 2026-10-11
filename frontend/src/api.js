import { REPORT_TTL_HOURS } from "./constants";

const API = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
export const isDemo = !API;

// ---- Demo mode: reports live in localStorage so the app works with no backend ----
const KEY = "flood-reports-demo";
const nowSec = () => Math.floor(Date.now() / 1000);
const seed = () => {
  const mk = (lat, lng, severity, note, minsAgo) => ({
    id: crypto.randomUUID(), lat, lng, severity, note, photoUrl: null,
    createdAt: Date.now() - minsAgo * 60000,
    expiresAt: nowSec() + (REPORT_TTL_HOURS * 60 - minsAgo) * 60,
  });
  return [
    mk(25.6125, 85.123, "knee", "Water outside the market, bikes are stalling", 25),
    mk(25.59, 85.165, "ankle", "Drain overflowing near the crossing", 70),
    mk(25.612, 85.144, "blocked", "Underpass is full, take another route", 12),
  ];
};
const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const s = seed();
  save(s);
  return s;
};
const save = (r) => { try { localStorage.setItem(KEY, JSON.stringify(r)); } catch {} };

// ---- Public API ----
export async function listReports() {
  if (isDemo) return load().filter((r) => r.expiresAt > nowSec());
  const res = await fetch(`${API}/reports`);
  if (!res.ok) throw new Error("Could not load reports");
  return (await res.json()).reports;
}

export async function createReport(data, photoFile) {
  if (isDemo) {
    const report = { id: crypto.randomUUID(), ...data, photoUrl: null, createdAt: Date.now(), expiresAt: nowSec() + REPORT_TTL_HOURS * 3600 };
    save([report, ...load()]);
    return report;
  }
  let photoKey;
  if (photoFile) {
    const up = await fetch(`${API}/upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType: photoFile.type }),
    });
    if (!up.ok) throw new Error("Could not prepare the photo upload");
    const { uploadUrl, key } = await up.json();
    const put = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": photoFile.type }, body: photoFile });
    if (!put.ok) throw new Error("Photo upload failed");
    photoKey = key;
  }
  const res = await fetch(`${API}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, photoKey }),
  });
  if (!res.ok) throw new Error("Could not post your report");
  return (await res.json()).report;
}
