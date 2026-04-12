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

## Project Structure

- `src/App.jsx` - app shell and layout
- `src/pages/` - Chat, Map, and Progress screens
- `src/components/` - reusable UI pieces
- `src/store/useGameStore.js` - global game state
- `src/services/api.js` - REST wrapper with mock fallbacks
