import { buildMissionText, getNextLocationId, getLocationById } from "../data/locations";

export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5678/api";

const CHAT_ENDPOINT = `${API_BASE}/chat`;
const VERIFY_PHOTO_ENDPOINT = `${API_BASE}/verify-photo`;

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function buildMockChatReply(message) {
  const text = message.trim().toLowerCase();
  const targetLocation = getLocationById("grand-place");

  if (text.includes("where") || text.includes("map")) {
    return {
      reply: `The next trail point is tied to ${targetLocation.name}. Follow the city center and watch for a detailed facade.`,
      nextMission: buildMissionText(targetLocation.id),
      suggestedTargetId: targetLocation.id,
    };
  }

  if (text.includes("hint") || text.includes("clue")) {
    return {
      reply: "Look for a landmark with strong symmetry, then check the quiet edge of the crowd.",
      nextMission: "Use the map to compare the clue against the four Brussels locations.",
    };
  }

  if (text.includes("photo") || text.includes("verify")) {
    return {
      reply: "Take a sharp photo with the landmark visible in frame. That is how the game verifies the stop.",
    };
  }

  return {
    reply: "I am tracking your route. Ask for a clue, check the map, or upload a photo when you reach the location.",
  };
}

async function parseJsonResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { reply: text } : {};
}

export async function sendMessage({ userId, message }) {
  try {
    const response = await fetch(CHAT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, message }),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed with status ${response.status}`);
    }

    return parseJsonResponse(response);
  } catch (error) {
    await delay(1200);
    return buildMockChatReply(message);
  }
}

function buildMockVerificationResponse(locationId) {
  const location = getLocationById(locationId);
  const nextLocationId = getNextLocationId(locationId);
  const nextLocation = nextLocationId ? getLocationById(nextLocationId) : null;

  return {
    success: true,
    message: `Correct location! ${location.name} is verified.`,
    nextChallenge: nextLocation
      ? `Your next challenge is ${nextLocation.name}. ${nextLocation.hint}`
      : "You cleared the Brussels route. Ask the guide for a bonus mission.",
    verifiedLocationId: location.id,
    nextTargetId: nextLocation?.id ?? null,
  };
}

export async function verifyPhoto({ userId, photo, locationId }) {
  const formData = new FormData();
  formData.append("userId", userId);
  formData.append("photo", photo);

  try {
    const response = await fetch(VERIFY_PHOTO_ENDPOINT, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Photo verification failed with status ${response.status}`);
    }

    return parseJsonResponse(response);
  } catch (error) {
    await delay(1400);
    return buildMockVerificationResponse(locationId);
  }
}