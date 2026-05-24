# the-boys-ui

React 18 + TypeScript frontend for TheBoys — a trip planning and expense splitting app for friend groups.

## Stack

- **React 18** + **TypeScript** via **Vite**
- **TanStack Query v5** — server state and caching
- **react-hook-form** + **zod** — form validation
- **Tailwind CSS** — utility-first styling with custom navy dark palette
- **axios** — HTTP client with JWT interceptor

## Local Setup

**Prerequisites:** Node 18+, API running on `http://localhost:3000`

```powershell
# Install dependencies
npm install

# Copy env (API URL already set for local dev)
cp .env.example .env

# Start dev server
npm run dev
```

UI starts on `http://localhost:5173`.

## Scripts

```powershell
npm run dev          # Vite dev server with HMR
npm run build        # TypeScript check + production build
npm run typecheck    # tsc --noEmit
npm run lint         # ESLint
npm run preview      # Preview production build locally
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000/api/v1` | Backend base URL |

## Features (Phases 1 & 2)

- **Auth** — Register (first name, last name, display name, email, password), Login, session persistence via `sessionStorage`
- **Dark mode** — toggle persisted to `localStorage`, navy palette derived from brand logo
- **Groups** — create, browse, join by invite code, view detail
- **Group detail** — invite code copy/regenerate, member list, leader-only remove member + delete group
- **Logo** — light/dark SVG variants swap automatically with theme
