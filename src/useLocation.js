import { useState } from "react";

export function useLocation() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);

  function requestLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };
        setLocation(coords);
      },
      (err) => {
        setError(err.message);
      }
    );
  }

  return { location, error, requestLocation };
}
