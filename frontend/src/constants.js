export const PATNA_CENTER = [25.5941, 85.1376];
export const REPORT_TTL_HOURS = 6;

export const SEVERITY = [
  { id: "ankle", label: "Ankle-deep", hint: "Slow, but you can get through", color: "#d9a400", radius: 9 },
  { id: "knee", label: "Knee-deep", hint: "Avoid on two-wheelers", color: "#e2661f", radius: 12 },
  { id: "blocked", label: "Road blocked", hint: "Not passable", color: "#c1272d", radius: 15 },
];
export const severityOf = (id) => SEVERITY.find((s) => s.id === id) ?? SEVERITY[0];

export function timeAgo(ms) {
  const mins = Math.max(1, Math.round((Date.now() - ms) / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return `${hrs} hr ago`;
}
