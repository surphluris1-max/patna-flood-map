import { useState } from "react";
import { SEVERITY } from "../constants";

const MAX_PHOTO_MB = 5;

export default function ReportForm({ position, onSubmit, onCancel }) {
  const [severity, setSeverity] = useState("knee");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function pickPhoto(e) {
    const file = e.target.files?.[0];
    if (file && file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setError(`Photo is too large. Choose one under ${MAX_PHOTO_MB} MB.`);
      e.target.value = "";
      return;
    }
    setError("");
    setPhoto(file ?? null);
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await onSubmit({ lat: position.lat, lng: position.lng, severity, note: note.trim() }, photo);
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="Report flooding">
      <div className="sheet">
        <h2>How bad is it here?</h2>
        <div className="severity">
          {SEVERITY.map((s) => (
            <button key={s.id} type="button" className={severity === s.id ? "on" : ""}
              style={{ "--c": s.color }} onClick={() => setSeverity(s.id)}>
              <strong>{s.label}</strong>
              <span>{s.hint}</span>
            </button>
          ))}
        </div>
        <label>
          What should others know?
          <textarea maxLength={200} rows={3} value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Example: Water is above the divider, buses are turning back" />
        </label>
        <label>
          Photo (optional)
          <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={pickPhoto} />
        </label>
        {error && <p className="error">{error}</p>}
        <div className="actions">
          <button type="button" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className="primary" onClick={submit} disabled={busy}>
            {busy ? "Posting…" : "Post report"}
          </button>
        </div>
      </div>
    </div>
  );
}
