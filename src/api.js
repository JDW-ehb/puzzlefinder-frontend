const CHAT_URL = "https://your-n8n.com/webhook/chat";
const PHOTO_URL = "https://your-n8n.com/webhook/verify-photo";

export async function sendChatMessage(text) {
  const response = await fetch(CHAT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
  });

  return response.json();
}

export async function sendPhoto(file) {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await fetch(PHOTO_URL, {
    method: "POST",
    method: "POST",
    body: formData,
  });

  return response.json();
}
