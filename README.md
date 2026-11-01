# KEEP UP — Android sports PWA starter

A phone-first installable web app for cricket and football scores.

## Project structure
- `index.html` — app layout and dialogs
- `styles.css` — premium dark UI
- `app.js` — filters, favorites, sample matches, API fetches and offline sports FAQ assistant
- `manifest.json` — Android install metadata
- `sw.js` — basic offline caching
- `icon.svg` — app icon

## Run on your Android phone
1. Create a public GitHub repository named `keep-up`.
2. Upload all files in this folder to the repository root.
3. Open Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save.
4. Wait for GitHub Pages to publish, then open the published HTTPS URL in Chrome.
5. Chrome menu (⋮) → Add to Home screen / Install app.

GitHub Pages requires a public repository for GitHub Free. Anyone can inspect source code in a public repo, so never paste API keys into source files.

## Live data setup
Open app Settings and enter keys on your own phone:
- Cricket: https://cricketdata.org/ — current-match endpoint currently uses `https://api.cricapi.com/v1/currentMatches?apikey=KEY&offset=0`.
- Football: https://dashboard.api-football.com/register — uses API-Football v3 `/fixtures?live=all` with `x-apisports-key` header.

The free provider tiers have strict quotas and competition/data coverage restrictions. The browser may also be blocked by provider CORS policy. This starter displays sample data until real provider data loads. Do not interpret sample scores as real matches.

## AI assistant limitation
The included assistant is an offline rule/FAQ helper, not a connected generative AI model. A real Gemini-powered assistant requires a server-side proxy or another secure backend so the model key is not exposed to visitors. Do not put a private AI key in public JavaScript.

## Current limitations
- No push notifications yet.
- No user accounts or cloud sync.
- Direct API calls may fail due to CORS or provider plan restrictions.
- Live updates are manual via the refresh button to conserve free API quotas.
