import { useCallback, useEffect, useState } from "react";
import FloodMap from "./components/FloodMap.jsx";
import ReportForm from "./components/ReportForm.jsx";
import ReportList from "./components/ReportList.jsx";
import { createReport, isDemo, listReports } from "./api";
import { REPORT_TTL_HOURS, SEVERITY } from "./constants";

export default function App() {
  const [reports, setReports] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [picking, setPicking] = useState(false);
  const [draft, setDraft] = useState(null); // {lat, lng}
  const [focus, setFocus] = useState(null);

  const load = useCallback(async () => {
    try {
      setReports(await listReports());
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  async function submit(data, photo) {
    await createReport(data, photo);
    setDraft(null);
    await load();
  }

  return (
    <div className="app">
      <aside className="panel">
        <h1>Which roads are underwater?</h1>
        <p className="sub">Reports from people on the street in Patna. Each one disappears after {REPORT_TTL_HOURS} hours.</p>
        <button className="primary" onClick={() => setPicking(true)}>Report flooding</button>
        {isDemo && <p className="note">Demo mode: reports are saved only in this browser.</p>}
        <ul className="legend">
          {SEVERITY.map((s) => (
            <li key={s.id}><span className="dot" style={{ background: s.color }} />{s.label}</li>
          ))}
        </ul>
        {status === "error" && <p className="error">Could not load reports. Check your connection, we retry every minute.</p>}
        <ReportList reports={reports} loading={status === "loading"} onSelect={setFocus} />
      </aside>

      <div className={`map-wrap ${picking ? "picking" : ""}`}>
        <FloodMap
          reports={reports}
          picking={picking}
          draft={draft}
          focus={focus}
          onPick={(pos) => { setDraft(pos); setPicking(false); }}
        />
        {picking && (
          <div className="hint">
            Tap the flooded spot on the map
            <button onClick={() => setPicking(false)}>Cancel</button>
          </div>
        )}
      </div>

      {draft && <ReportForm position={draft} onSubmit={submit} onCancel={() => setDraft(null)} />}
    </div>
  );
}
