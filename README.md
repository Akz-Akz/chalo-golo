# Chalo Golo

Chalo Golo is a futuristic GenZ learning game platform set in space: personalized roadmaps, XP progression, community momentum, focus protection, and demo-ready quiz battles.

## Current Stabilization Pass

- Unified the visual language around a dark cinematic galaxy system using `#070B14`, `#0B1020`, `#111827`, neon purple, electric blue, cosmic pink, and orange accents.
- Added shared galaxy/starfield styling, glass panels, glowing buttons, animated hover states, warning overlays, and responsive dashboard/battle surfaces.
- Integrated the app logo across the landing/auth/dashboard shell and favicon/metadata.
- Added a routed SPA shell with `BrowserRouter`, stable URL paths, browser back/forward behavior, deep route refresh support, and Vercel rewrites.
- Added a modular animated avatar card tied to profile image, XP, level aura, hover glow, idle float, and customization cycling.
- Added automatic profile picture assignment from `public/images/profile-pictures/` with persisted local/Supabase avatar URLs.
- Reworked anti-distraction warnings with approved learning-resource navigation exceptions, duplicate-increment protection, session persistence, warning images, custom warning copy, red cinematic glow, and warning sounds.
- Added centralized `audioManager` with win/lose/warning pools, preloading, overlap throttling, mobile-safe playback, and persistent global mute.
- Added fake realtime versus quiz battle mode with countdown, AI opponent timing, score race, combo effects, and winner reveal.
- Added community online/offline toggle with awake/sleeping states, local persistence, and visible status treatment.
- Expanded Playwright smoke coverage for navigation, deep routes, avatars, battle mode, presence, and mute controls.

## Frontend

```bash
cd Chalo-Golo/frontend
npm install
npm run dev
```

Useful commands:

```bash
npm run build
npm run lint
npm run test:e2e
```

## Assets

Demo assets live under:

- `Chalo-Golo/frontend/public/images/logo.png`
- `Chalo-Golo/frontend/public/images/warning-2.png`
- `Chalo-Golo/frontend/public/images/warning-3.png`
- `Chalo-Golo/frontend/public/images/profile-pictures/`
- `Chalo-Golo/frontend/public/sound-effects/win/`
- `Chalo-Golo/frontend/public/sound-effects/lose/`
- `Chalo-Golo/frontend/public/sound-effects/warning/`

## Architecture Notes

- State remains centered on Zustand stores for user, UI, roadmap, and quiz state.
- React Router provides SPA history while existing page components are preserved.
- Vercel uses `vercel.json` rewrites to serve `index.html` for deep routes.
- Approved educational resources are whitelisted before `window.open` so focus warnings do not trigger on recommended course links.
- Audio is centralized in `src/services/audioManager.js`; profile assets and warning assets are centralized in `src/services/assets.js`.

## Environment

Create `Chalo-Golo/frontend/.env.local` for Supabase:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Without Supabase, guest/demo mode uses local storage so hackathon demos still work.
