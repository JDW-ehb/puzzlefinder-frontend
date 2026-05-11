import { useEffect, useMemo } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const brusselsCenter = [50.8503, 4.3517];
const belgiumBounds = [
  [49.45, 2.45],
  [51.65, 6.45],
];

function createMarkerIcon(accentColor, isTarget) {
  return L.divIcon({
    className: "",
    html: `
      <div style="position: relative; display: grid; place-items: center; width: 2.5rem; height: 2.5rem;">
        <div style="position:absolute; inset:-0.35rem; border-radius:9999px; background:${accentColor}; opacity:${isTarget ? 0.28 : 0.16}; filter: blur(1px);"></div>
        <div style="width:1.2rem; height:1.2rem; border-radius:9999px; border:2px solid rgba(255,255,255,0.9); background:${accentColor}; box-shadow:0 0 0 8px rgba(255,255,255,0.06);"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

function MapFocus({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, map, zoom]);

  return null;
}

function UserLocationMarker({ userLocation }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], Math.max(map.getZoom(), 14), {
        duration: 0.8,
      });
    }
  }, [map, userLocation]);

  if (!userLocation) {
    return null;
  }

  return (
    <>
      <Marker position={[userLocation.lat, userLocation.lng]} icon={createMarkerIcon("#38bdf8", true)}>
        <Popup>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">You are here</p>
            <p className="text-xs text-slate-600">
              {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
            </p>
          </div>
        </Popup>
      </Marker>
    </>
  );
}

export default function GameMap({ targetLocation, userLocation, compact = false, theme = "dark" }) {
  const hasTargetCoords = Boolean(
    targetLocation && Number.isFinite(targetLocation.lat) && Number.isFinite(targetLocation.lng)
  );

  const center = useMemo(() => {
    if (userLocation) {
      return [userLocation.lat, userLocation.lng];
    }

    if (hasTargetCoords) {
      return [targetLocation.lat, targetLocation.lng];
    }

    return brusselsCenter;
  }, [targetLocation, userLocation]);

  const tileUrl =
    theme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";

  return (
          <div className={`overflow-hidden rounded-[2rem] border border-slate-300/40 bg-white/70 dark:border-white/10 dark:bg-slate-900/80 ${compact ? "h-[20rem]" : "h-full min-h-[28rem]"}`}>
      <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full" maxBounds={belgiumBounds} maxBoundsViscosity={0.9}>
        <MapFocus center={center} zoom={13} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={tileUrl}
        />

        <UserLocationMarker userLocation={userLocation} />

        {hasTargetCoords ? (
          <Circle
            center={[targetLocation.lat, targetLocation.lng]}
            radius={180}
            pathOptions={{
              color: "#f59e0b",
              fillColor: "#f59e0b",
              fillOpacity: 0.16,
              weight: 2,
              dashArray: "8 8",
            }}
          />
        ) : null}

      </MapContainer>
    </div>
  );
}
