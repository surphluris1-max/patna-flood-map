import { useEffect } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { PATNA_CENTER, severityOf, timeAgo } from "../constants";

function ClickCapture({ active, onPick }) {
  useMapEvents({ click: (e) => active && onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => { if (target) map.flyTo([target.lat, target.lng], 16); }, [target, map]);
  return null;
}

export default function FloodMap({ reports, picking, draft, focus, onPick }) {
  return (
    <MapContainer center={PATNA_CENTER} zoom={13} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickCapture active={picking} onPick={onPick} />
      <FlyTo target={focus} />
      {reports.map((r) => {
        const s = severityOf(r.severity);
        return (
          <CircleMarker
            key={r.id}
            center={[r.lat, r.lng]}
            radius={s.radius}
            pathOptions={{ color: "#fff", weight: 2, fillColor: s.color, fillOpacity: 0.9 }}
          >
            <Popup>
              <strong>{s.label}</strong>
              {r.note && <p>{r.note}</p>}
              {r.photoUrl && <img src={r.photoUrl} alt="Flooded street" className="popup-photo" />}
              <small>{timeAgo(r.createdAt)}</small>
            </Popup>
          </CircleMarker>
        );
      })}
      {draft && (
        <CircleMarker center={[draft.lat, draft.lng]} radius={12}
          pathOptions={{ color: "#0f6e8c", weight: 3, dashArray: "4 4", fillOpacity: 0.1 }} />
      )}
    </MapContainer>
  );
}
