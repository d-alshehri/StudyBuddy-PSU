import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const tealIcon = new L.DivIcon({
  className: "",
  html: `<div style="background:#11C5C6;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const meIcon = new L.DivIcon({
  className: "",
  html: `<div style="background:#1d4ed8;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 6px rgba(29,78,216,0.25)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Prince Sultan University, Riyadh — Rafha Street, King Salman Neighborhood
export const PSU_CENTER: [number, number] = [24.73981, 46.70461];

export const PSU_BUILDINGS: { name: string; pos: [number, number] }[] = [
  { name: "Building N",    pos: [24.7407, 46.7046] },
  { name: "Building W",    pos: [24.7398, 46.7037] },
  { name: "Building S",    pos: [24.7389, 46.7050] },
  { name: "Main Building", pos: [24.7398, 46.7055] },
];

function Recenter({ pos }: { pos: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (pos) map.setView(pos, 17);
  }, [pos, map]);
  return null;
}

interface Props {
  height?: string;
  selected?: string;
  onSelect?: (name: string) => void;
  partners?: { name: string; location: string }[];
  showMe?: boolean;
}

export const CampusMap = ({ height = "320px", selected, onSelect, partners = [], showMe = true }: Props) => {
  const [me, setMe] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (!showMe || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setMe([p.coords.latitude, p.coords.longitude]),
      () => setMe(null),
      { enableHighAccuracy: true }
    );
  }, [showMe]);

  return (
    <div style={{ height }} className="rounded-3xl overflow-hidden border-2 border-border">
      <MapContainer center={PSU_CENTER} zoom={17} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {PSU_BUILDINGS.map((b) => (
          <Marker
            key={b.name}
            position={b.pos}
            icon={tealIcon}
            eventHandlers={{ click: () => onSelect?.(b.name) }}
          >
            <Popup>
              <strong>{b.name}</strong>
              {selected === b.name && <div style={{ color: "#11C5C6" }}>Selected</div>}
            </Popup>
          </Marker>
        ))}
        {partners.map((p, i) => {
          const b = PSU_BUILDINGS.find((x) => p.location?.includes(x.name));
          if (!b) return null;
          return (
            <Marker key={i} position={b.pos} icon={tealIcon}>
              <Popup><strong>{p.name}</strong><br/>{p.location}</Popup>
            </Marker>
          );
        })}
        {me && (
          <>
            <Marker position={me} icon={meIcon}>
              <Popup>You are here</Popup>
            </Marker>
            <Recenter pos={me} />
          </>
        )}
      </MapContainer>
    </div>
  );
};
