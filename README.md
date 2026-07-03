# Catch — Link Organizer

Save any link — webpage or image — with tags, in one clean place. Syncs across devices.

## 1. Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account/project.
2. In your project dashboard, go to **SQL Editor** → **New query**, paste the contents of
   `supabase/schema.sql`, and click **Run**. This c
   reates the `links` table and locks it down
   so only you can read/write your own rows.
3. Go to **Project Settings → API**. Copy the **Project URL** and the **anon public** key.
4. In this project, copy `.env.example` to `.env` and paste those two values in:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxxxx
   ```
5. In Supabase, go to **Authentication → URL Configuration** and add your dev URL
   (`http://localhost:5173`) and your future production URL to **Redirect URLs**.
   Also disable "Confirm email" under **Authentication → Providers → Email** if you want the
   sign-in link to work instantly on first try (optional, just smoother for a single-user app).

## 2. Run it locally

```bash
npm install
npm run dev
```

Open the printed local URL, enter your email, and click the sign-in link sent to your inbox.
You only need to do this once per device — the session persists.

## 3. Deploy (free)

Easiest path: push this folder to a GitHub repo, then import it on
[vercel.com](https://vercel.com) (or Netlify). Add the same two env vars
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the host's project settings. Once deployed,
add that live URL to Supabase's **Redirect URLs** too.

## How it works

- **Paste a link** in the bar at the top, optionally add comma-separated tags, hit **Save**.
- If the link is a webpage, its title and preview image are fetched automatically
  (via the free [microlink.io](https://microlink.io) metadata API — no key needed for
  light personal use).
- If the link is a direct image URL (ends in `.png`, `.jpg`, `.gif`, etc.), the image itself
  becomes the card's banner.
- Click a tag pill to filter; use the search box to find by title, URL, domain, or tag.
- Hover a card to edit its tags or delete it.

## Project structure

```
src/
  components/   UI pieces (Auth, CatchBar, LinkCard, LinkGrid, TagFilter, EmptyState)
  hooks/        useLinks.js — all Supabase read/write logic
  lib/          supabase.js (client), metadata.js (URL/image detection, OG fetch)
supabase/
  schema.sql    Run this once in the Supabase SQL editor
```

## Next: the browser extension

This web app is step one. Step two is a small Manifest V3 Chrome extension that:
- Adds a right-click "Save to Catch" on any link or image
- Optionally watches your clipboard and offers a one-click save when you copy a URL
- Writes to the same `links` table using the same Supabase project (just needs the same
  URL + anon key, plus you staying signed in via the extension's own auth flow)

Say the word when you're ready and we'll scaffold that next, wired to this same backend.
