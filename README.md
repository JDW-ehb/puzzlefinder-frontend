# PuzzleFinder Frontend

Mobile-first React MVP for PuzzleFinder, an AI-guided location puzzle game in Brussels.

## Stack

- React
- Tailwind CSS
- Zustand
- react-leaflet / Leaflet
- Fetch-based API layer for n8n webhooks

## What It Includes

- WhatsApp-style chat with AI guide responses
- Leaflet map with Brussels locations and target highlighting
- Photo upload verification flow with preview and loading states
- Progress tracking, badges, and mission display
- Bottom navigation for Chat, Map, and Progress

## Local Development

Install dependencies and start the app:

```bash
npm install
npm start
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## Docker

Build and run the production container:

```bash
docker compose up --build
```

Open the app at http://localhost:8080.

If your n8n API is not on the default URL, update `REACT_APP_API_BASE` in `docker-compose.yml` or pass a different build arg.

## API Configuration

By default the frontend uses:

```text
http://localhost:5678/api
```

Set `REACT_APP_API_BASE` if your n8n webhooks live somewhere else.

You can also configure chat timeout behavior:

```text
REACT_APP_CHAT_TIMEOUT_MS=5000
```

If chat receives no response within 5 seconds (or your configured timeout), the UI posts:

```text
Error: AI is down right now. Please try again in a few seconds.
```

## Required Backend Endpoints

The frontend now expects real backend endpoints for all core logic (no mock fallback for chat/photo verification):

- `POST /auth/login`
	- body: `{ email, password }`
	- response: `{ token }` or `{ accessToken }`
- `POST /auth/register`
	- body: `{ name, email, password }`
	- response: `{ token }` or `{ accessToken }`
- `GET /auth/me`
	- header: `Authorization: Bearer <token>`
	- response: `{ user: { id, email, ... } }` or user object
- `GET /game/state`
	- response: `{ currentMission, currentTargetId, progress, unlockedLocations, selectedLocationId, chatMessages }`
- `GET /game/locations`
	- response: `{ locations: [...] }` or `[...]`
- `POST /game/location`
	- body: `{ lat, lng, accuracy }`
- `POST /game/progress`
	- body: `{ progress, unlockedLocations }`
- `POST /chat`
	- body: `{ message, currentMission, currentTargetId, guestMode }`
	- response: `{ reply, nextMission?, suggestedTargetId? }`
- `POST /verify-photo`
	- multipart form data: `photo`, `locationId`
	- response: `{ success, message, nextChallenge?, nextMission?, nextTargetId? }`

## Project Structure

- `src/App.jsx` - app shell and layout
- `src/pages/` - Chat, Map, and Progress screens
- `src/components/` - reusable UI pieces
- `src/store/useGameStore.js` - auth + global game state + backend sync
- `src/services/api.js` - REST wrapper with auth headers and timeouts

## Guest Mode

- The login screen now includes `Sign in as Guest`.
- Guest users can access the same gameplay flow, but account features are limited.
- Guest state is intentionally not persisted, so progress/chat data resets when the session ends or page reloads.
