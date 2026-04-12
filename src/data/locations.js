export const mockLocations = [
  {
    id: "grand-place",
    name: "Grand Place",
    lat: 50.8467,
    lng: 4.3525,
    hint: "Look for a carved detail that catches the afternoon light.",
    description: "Historic square with ornate guild houses and a perfect first clue.",
  },
  {
    id: "mont-des-arts",
    name: "Mont des Arts",
    lat: 50.8428,
    lng: 4.3568,
    hint: "Search the steps where the city opens toward the horizon.",
    description: "A cultural ridge with terraces, gardens, and an easy landmark to scan.",
  },
  {
    id: "atomium",
    name: "Atomium",
    lat: 50.8949,
    lng: 4.3416,
    hint: "A shiny structure with a geometry that is hard to miss.",
    description: "An iconic Brussels landmark that makes a bold mid-game target.",
  },
  {
    id: "cinquantenaire",
    name: "Parc du Cinquantenaire",
    lat: 50.8436,
    lng: 4.3910,
    hint: "Find the arch, then look for the quieter path nearby.",
    description: "A large park with enough space to hide a more subtle puzzle trail.",
  },
];

export function getLocationById(locationId) {
  return mockLocations.find((location) => location.id === locationId) ?? mockLocations[0];
}

export function getNextLocationId(locationId) {
  const currentIndex = mockLocations.findIndex((location) => location.id === locationId);
  if (currentIndex === -1) {
    return mockLocations[0]?.id ?? null;
  }

  const nextLocation = mockLocations[currentIndex + 1];
  return nextLocation?.id ?? null;
}

export function buildMissionText(locationId) {
  const location = getLocationById(locationId);
  return `Head to ${location.name}. ${location.hint}`;
}