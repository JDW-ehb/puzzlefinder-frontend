import { useMemo } from "react";
import GameMap from "../components/Map/GameMap";
import { useGameStore } from "../store/useGameStore";

function calculateDistanceMeters(start, end) {
  if (!start || !end) {
    return null;
  }

  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const deltaLat = toRadians(end.lat - start.lat);
  const deltaLng = toRadians(end.lng - start.lng);
  const lat1 = toRadians(start.lat);
  const lat2 = toRadians(end.lat);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(earthRadius * c);
}

export default function MapPage() {
  const selectedLocationId = useGameStore((state) => state.selectedLocationId);
  const currentTargetId = useGameStore((state) => state.currentTargetId);
  const locations = useGameStore((state) => state.locations);
  const userLocation = useGameStore((state) => state.userLocation);
  const locationError = useGameStore((state) => state.locationError);
  const requestLocation = useGameStore((state) => state.requestLocation);
  const theme = useGameStore((state) => state.theme);

  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === selectedLocationId) ?? locations[0],
    [locations, selectedLocationId]
  );

  const targetLocation = useMemo(
    () => locations.find((location) => location.id === currentTargetId) ?? selectedLocation,
    [locations, currentTargetId, selectedLocation]
  );

  const distanceToTarget = calculateDistanceMeters(userLocation, targetLocation);
  const userLocationLabel = userLocation
    ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
    : "Tap Share location to show your position on the map.";

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-white/10 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">Explore</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Belgium map</h2>
          </div>
          <button
            type="button"
            onClick={requestLocation}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-cyan-300/40 hover:text-cyan-200"
          >
            Share location
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">You are here</p>
            <p className="mt-1 text-sm font-medium text-white">{userLocationLabel}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Search mode</p>
            <p className="mt-1 text-sm font-medium text-white">No street labels</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Target distance</p>
            <p className="mt-1 text-sm font-medium text-white">
              {distanceToTarget ? `${distanceToTarget.toLocaleString()} m away` : "Enable location to calculate"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Objective</p>
            <p className="mt-1 text-sm font-medium text-white">Hidden in a small zone</p>
          </div>
        </div>

        {locationError ? (
          <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{locationError}</p>
        ) : null}
      </div>

      <div className="px-4 pt-4">
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">Belgium map</p>
              <h3 className="mt-1 text-lg font-semibold text-white">Where you are in Belgium</h3>
              <p className="mt-1 text-sm text-slate-400">
                This map hides labels and exact points. Use the orange circle as your only target zone.
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-xs font-medium text-slate-300">
              No-label explorer
            </span>
          </div>

          <div className="mt-4">
            <GameMap
              targetLocation={targetLocation}
              userLocation={userLocation}
              theme={theme}
              compact
            />
          </div>
        </div>
      </div>
    </div>
  );
}
