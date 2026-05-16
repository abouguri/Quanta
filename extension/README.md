# Quanta — Browser Extension

A Chromium extension (Manifest V3) that measures the credibility of the article in the user's current tab and renders the score in a popup.

*Truth, measured.*

## Architecture

| Layer | File | Purpose |
|---|---|---|
| Popup | `src/popup/Popup.tsx` | React state machine: `idle → measuring → result \| error \| limit` |
| Content script | `src/content/reader.ts` | Runs [`@mozilla/readability`](https://github.com/mozilla/readability) on the active page and returns `{title, byline, textContent, …}` |
| Service worker | `src/background/service-worker.ts` | Opens a long-lived `chrome.runtime.Port`, proxies SSE from `/api/analyze`, forwards `PROGRESS` / `RESULT` / `ERROR` messages back to the popup |
| Storage | `src/lib/storage.ts` | `chrome.storage.local` wrappers for history, rate limit, and install id |

The service worker (not the popup) holds the fetch — popups die on blur, killing in-flight requests.

## Develop

```bash
cd extension
npm install
npm run dev      # Vite popup HMR; reload extension manually after content/SW edits
npm run build    # outputs ./dist
```

Load it in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right)
3. Click **Load unpacked**
4. Select `extension/dist`

## Switching API base

Edit `src/lib/config.ts`:

```ts
// production
export const API_BASE_URL = 'https://factnews.vercel.app'
// local Next.js dev server
// export const API_BASE_URL = 'http://localhost:3000'
```

The `/api/analyze` route sends CORS headers and accepts the optional `X-Quanta-Install-Id` header for per-install rate limiting (3 analyses / 24 h).

## Free-tier rate limit

Tracked in two places:

- **Client (primary):** array of ISO timestamps in `chrome.storage.local` under `quanta_rate_limit`; the Analyze button is disabled once `length >= 3` within a rolling 24 h window.
- **Server (defensive):** identical check keyed by the `X-Quanta-Install-Id` header; returns `429` with `Retry-After`.

## Known divergences for other browsers (not built)

- **Firefox** — needs `browser_specific_settings.gecko.id` in `manifest.json`; service worker becomes an event page.
- **Safari** — Xcode wrapper required; popup styling carries over but `chrome.*` should be polyfilled via `webextension-polyfill`.
