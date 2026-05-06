export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5678/webhook";
export const CHAT_TIMEOUT_MS = Number(process.env.REACT_APP_CHAT_TIMEOUT_MS || 30000);

const ENDPOINTS = {
  login: `${API_BASE}/auth/login`,
  register: `${API_BASE}/auth/register`,
  me: `${API_BASE}/auth/me`,
  state: `${API_BASE}/game/state`,
  locations: `${API_BASE}/game/locations`,
  locationPing: `${API_BASE}/game/location`,
  progress: `${API_BASE}/game/progress`,
  chat: `${API_BASE}/chat`,
  verifyPhoto: `${API_BASE}/verify-photo`,
};

function withTimeout(signal, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timeout),
  };
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : {};
}

async function request(url, { method = "GET", token, body, signal, timeoutMs = 15000 } = {}) {
  const timeoutControl = withTimeout(signal, timeoutMs);
  const isFormData = body instanceof FormData;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
  };

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      signal: timeoutControl.signal,
    });

    const payload = await parseResponse(response);

    if (!response.ok) {
      const backendMessage = payload?.error || payload?.message;
      throw new Error(backendMessage || `Request failed (${response.status})`);
    }

    return payload;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("Request timed out");
    }

    throw error;
  } finally {
    timeoutControl.clear();
  }
}

export async function loginUser({ email, password }) {
  return request(ENDPOINTS.login, {
    method: "POST",
    body: { email, password },
  });
}

export async function registerUser({ name, email, password }) {
  return request(ENDPOINTS.register, {
    method: "POST",
    body: { name, email, password },
  });
}

export async function fetchSession(token) {
  return request(ENDPOINTS.me, { token });
}

export async function fetchGameState(token) {
  return request(ENDPOINTS.state, { token });
}

export async function fetchLocations(token) {
  return request(ENDPOINTS.locations, { token });
}

export async function syncProgress({ token, progress, unlockedLocations }) {
  return request(ENDPOINTS.progress, {
    method: "POST",
    token,
    body: { progress, unlockedLocations },
  });
}

export async function syncUserLocation({ token, location }) {
  return request(ENDPOINTS.locationPing, {
    method: "POST",
    token,
    body: location,
  });
}

export async function sendMessage({ token, message, currentMission, currentTargetId, isGuest }) {
  return request(ENDPOINTS.chat, {
    method: "POST",
    token,
    timeoutMs: CHAT_TIMEOUT_MS,
    body: {
      message,
      currentMission,
      currentTargetId,
      guestMode: Boolean(isGuest),
    },
  });
}

export async function verifyPhoto({ token, photo, locationId }) {
  const base64 = await new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    img.onload = () => {
      const maxSize = 512;
      let w = img.width, h = img.height;
      if (w > h && w > maxSize) { h = h * maxSize / w; w = maxSize; }
      else if (h > maxSize) { w = w * maxSize / h; h = maxSize; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(photo);
  });

  return request(ENDPOINTS.verifyPhoto, {
    method: "POST",
    token,
    body: { photo: base64, locationId: locationId || "" },
    timeoutMs: 60000,
  });
}