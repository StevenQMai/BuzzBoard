# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Golden rules (project-specific)
- **UI consistency**:
  - Use Tailwind and the existing glass aesthetic via `.glass-surface` (see `client/src/app/globals.css`).
  - Preserve dark-mode behavior (`dark` class strategy).
  - Prefer fluid sizing with `clamp()` in hero/major layout areas.
- **Filters dropdown placement**:
  - Filters belong on **event-list surfaces** (e.g. `/home` search row), not in the global navbar.
  - Filters should **not** appear on event details (`/events/[id]`).
- **Navbar search behavior**:
  - If search appears on a page, it must be functional (typing + submit action).
  - On pages that can’t filter in-place (e.g. event details), submit should navigate to `/home?q=...#events-feed`.
- **No dead controls**: don’t introduce buttons/inputs that do nothing.

## Repo layout
Monorepo:
- `client/` — Next.js App Router + TypeScript + Tailwind + Firebase web SDK
- `server/` — Express + TypeScript + Firebase Admin SDK

Frontend calls backend at `http://localhost:5000/api/*`.

## Commands

### Client (Next.js, port 3000)
```bash
cd client
npm run dev
npm run build
npm run lint
```

### Server (Express, port 5000)
```bash
cd server
npm run dev
npm run build
npm test
```

### Typical local workflow
Run both:
- `client`: `npm run dev`
- `server`: `npm run dev`

## Architecture + data flow
Two data paths:
1. **API path**: Client → Express (`/api/events`) → Firestore via Admin SDK
2. **Direct Firestore (client SDK)**: auth, friends, presence, RSVPs, realtime subscriptions

Be explicit about which path you’re using when adding features.

## Frontend conventions (Next.js App Router)
- Pages live in `client/src/app/**/page.tsx`.
- Shared UI in `client/src/components/`.
- Hooks in `client/src/hooks/`.
- Firebase init + stores + helpers in `client/src/lib/`.

### Next.js pitfalls to avoid
- `useSearchParams()` / `useRouter()`:
  - If using `useSearchParams()` in a client page, follow Next’s requirement and wrap the usage in Suspense:
    - `<Suspense fallback={null}>...</Suspense>`
- Keep server/client boundaries clear:
  - Most components are client components (`"use client"`); don’t add server-only code there.

## Backend conventions (Express)
- Entry: `server/src/index.ts`
- Event routes: `server/src/routes/events.ts`
- Firebase admin init: `server/src/firebaseAdmin.ts`
- No auth middleware currently; do not assume API calls are authenticated.

## Firestore schema (high level)
- `events/{id}`
- `users/{uid}`
- `users/{uid}/friends`
- `users/{uid}/presence`
- `friendRequests/{id}`

## Implementation preferences
- Prefer small, composable components over big conditional blobs.
- Prefer derived UI state with `useMemo` and stable handlers.
- Keep TypeScript strictness intact; avoid `any` unless unavoidable.
- Avoid unnecessary dependencies.

## Testing expectations
- **UI changes**:
  - `cd client && npm run build` (catches TS + App Router prerender issues)
  - `cd client && npm run lint` (when touching multiple UI files)
- **API changes**:
  - Ensure server still runs and `GET /api/events` works.

## Environment
- Client requires `.env.local` with Firebase web SDK vars.
- Server requires `.env` with:
  - `FIREBASE_SERVICE_ACCOUNT_KEY` (minified JSON string)
  - `FIREBASE_DATABASE_URL`

## When unsure
Search for existing patterns before inventing new ones:
- Navbar/search patterns: `client/src/components/Navbar.tsx`
- Event filtering logic: `client/src/components/EventGrid.tsx`
- Styling primitives: `client/src/app/globals.css`