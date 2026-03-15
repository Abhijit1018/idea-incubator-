# Idea Incubator Frontend

React + Vite frontend for the Idea Incubator platform.

## What It Does

- Submit ideas or tools for processing.
- Poll and display generated catalogs.
- Show detailed architecture/analysis output per catalog item.
- Provide catalog chat and semantic search interactions.

## Tech Stack

- React 19
- Vite 7
- Tailwind CSS
- framer-motion
- lucide-react
- mermaid

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

3. Start dev server:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## Environment Variables

- `VITE_API_BASE_URL`: backend API base URL.

Example:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Production Build

```bash
npm run build
npm run preview
```

## Docker Deployment

Build image:

```bash
docker build --build-arg VITE_API_BASE_URL=https://your-backend-domain.com -t idea-incubator-frontend .
```

Run container:

```bash
docker run -p 8080:80 idea-incubator-frontend
```

## Deploy Notes

- Set `VITE_API_BASE_URL` to the public backend URL.
- Ensure backend CORS allows your frontend domain.
- This app is SPA-routed; the provided Nginx config includes `try_files` fallback to `index.html`.
