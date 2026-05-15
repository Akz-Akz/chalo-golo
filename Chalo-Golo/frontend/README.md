# Chalo Golo Frontend

React + Vite frontend for Chalo Golo, a cinematic space-themed learning game platform.

## What Changed

- Unified galaxy/neon UI system with shared starfield, glassmorphism, glow borders, premium gaming buttons, warning animations, and responsive battle/dashboard styling.
- SPA routing now uses `BrowserRouter` with stable paths: `/`, `/auth`, `/dashboard`, `/roadmap`, `/community`, `/schedule`, `/minigame`, `/battle`, `/onboarding`, `/attention-test`, and generation screens.
- Avatar system added via `src/components/AvatarCard.jsx`, including idle float, level aura, XP display, profile-picture fallback, and customization cycling.
- Profile images are assigned automatically from `public/images/profile-pictures/` and persisted locally/Supabase as `profileImage` / `avatar_url`.
- Warning system now distinguishes approved learning redirects from suspicious tab switches, throttles duplicate increments, persists warning count in-session, and uses warning images/sounds for escalation.
- Central audio service added in `src/services/audioManager.js` with win, lose, and warning pools plus global persistent mute.
- Demo-ready fake realtime quiz battle added in `src/components/VersusBattlePage.jsx`.
- Community presence toggle added for online/offline status.
- Logo integrated in UI, favicon, and metadata.

## Setup

```bash
npm install
npm run dev
```

Optional Supabase config:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Verification

```bash
npm run build
npm run lint
npm run test:e2e
```

The Playwright suite verifies landing, demo dashboard, avatar assignment, route back/forward, deep `/battle` refresh, battle mode, presence toggle, and mute control.

## Deployment

`vercel.json` rewrites all routes to `/index.html`, so refreshed deep SPA routes work on Vercel.
