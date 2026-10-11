import { severityOf, timeAgo } from "../constants";

export default function ReportList({ reports, loading, onSelect }) {
  if (loading) return <p className="empty">Loading reports…</p>;
  if (!reports.length)
    return <p className="empty">No flooding reported right now. If you see water on the road, report it.</p>;

  const sorted = [...reports].sort((a, b) => b.createdAt - a.createdAt);
  return (
    <ul className="reports">
      {sorted.map((r) => {
        const s = severityOf(r.severity);
        return (
          <li key={r.id}>
            <button onClick={() => onSelect({ lat: r.lat, lng: r.lng })}>
              <span className="dot" style={{ background: s.color }} />
              <span className="body">
                <strong>{s.label}</strong>
                <span>{r.note || "No details added"}</span>
              </span>
              <small>{timeAgo(r.createdAt)}</small>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
