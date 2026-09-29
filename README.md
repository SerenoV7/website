# serenov7.com

Personal website built with React + Vite + React Router, developed with Bun and deployed to GitHub Pages via GitHub Actions.

## Develop
```bash
bun install
bun run dev
```

## Build
```bash
bun run build   # outputs to dist/
bun run preview
```

## Add a page
1. Create `src/pages/MyPage.tsx`
2. Add `<Route path="my-page" element={<MyPage />} />` in `src/App.tsx`
3. Add a link in `src/components/Layout.tsx`

## Deploy
Push to `main`. In the repo: **Settings → Pages → Source: GitHub Actions**, and set the custom domain to `serenov7.com`.
Commit `bun.lock` (created by `bun install`) — CI uses `--frozen-lockfile`.
