function toNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

export function normalizeLocations(payload) {
  const sourceLocations = Array.isArray(payload) ? payload : payload?.locations;

  if (!Array.isArray(sourceLocations)) {
    return [];
  }

  return sourceLocations
    .map((entry, index) => {
      const idValue = entry?.id ?? entry?.locationID ?? entry?.step_number ?? entry?.stepNumber ?? index;
      const id = String(idValue);
      const name = entry?.name?.trim?.() || `Mission ${index + 1}`;
      const hint = entry?.clue?.trim?.() || entry?.base_clue?.trim?.() || entry?.hint?.trim?.() || "";
      const description = entry?.description?.trim?.() || "";
      const lat = toNumber(entry?.lat ?? entry?.latitude);
      const lng = toNumber(entry?.lng ?? entry?.longitude);

      if (!id || !name) {
        return null;
      }

      return {
        id,
        name,
        lat,
        lng,
        hint,
        description,
      };
    })
    .filter(Boolean);
}

export function getLocationById(locationId, locations = []) {
  const resolvedLocations = Array.isArray(locations) ? locations : [];
  return resolvedLocations.find((location) => String(location.id) === String(locationId)) ?? resolvedLocations[0] ?? null;
}

export function getNextLocationId(locationId, locations = []) {
  const resolvedLocations = Array.isArray(locations) ? locations : [];
  const currentIndex = resolvedLocations.findIndex((location) => String(location.id) === String(locationId));

  if (currentIndex === -1) {
    return resolvedLocations[0]?.id ?? null;
  }

  const nextLocation = resolvedLocations[currentIndex + 1];
  return nextLocation?.id ?? null;
}

export function buildMissionText(location, locations = []) {
  const resolvedLocation = typeof location === "object" && location ? location : getLocationById(location, locations);

  if (!resolvedLocation) {
    return "Mission data is loading from the webhook...";
  }

  const clue = resolvedLocation.hint || resolvedLocation.clue || resolvedLocation.base_clue || "Follow the webhook clue.";
  return `Head to ${resolvedLocation.name}. ${clue}`;
}