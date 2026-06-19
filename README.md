# RiverLaunch.info Website

Static marketing website for RiverLaunch.info.

The site is intentionally plain HTML, CSS, and small vanilla JavaScript files so
Firebase Hosting can serve it without a bundler. Product screenshots are
captured from the sibling `../river-go` app and stored in
`public/assets/screenshots`.

## Local preview

Run the bundled lightweight dev server (zero dependencies, just Node):

```sh
npm run dev
```

It serves `public/` at http://localhost:5050 and mirrors the Firebase Hosting
config locally — clean URLs (`/product` → `product.html`), no trailing slashes,
and the custom `404.html`. Override the port or host with `PORT` / `HOST`:

```sh
PORT=8080 npm run dev
```

You can still open `public/index.html` directly in a browser, but file URLs do
not get the clean-URL behaviour.

## Theme

The site ships the app's **Surge** theme (dark navy with electric-blue and
signal-yellow accents, Space Grotesk + Sora type) as the default, with a
**Daybreak** light alternate. The two share one accent language and are driven
entirely by CSS custom properties in `public/assets/site.css` — Surge tokens
live in `:root`, Daybreak overrides under `[data-theme="daybreak"]`. The header
toggle (wired by `public/assets/theme.js`) flips `data-theme` on `<html>` and
remembers the choice in `localStorage`; a tiny inline `<head>` script applies
the saved theme before paint to avoid a flash.

## Screenshots

Product screenshots live in `public/assets/screenshots` and are captured from a
running instance of the sibling `../river-go` app. To regenerate them (desktop
views plus device-framed mobile shots):

```sh
# with the app running locally and Playwright installed in ../river-go
APP_USER=member@example.com APP_PASS=… node scripts/capture-screenshots.mjs
```

It logs in, captures the Discover, map+river, and river-detail views plus the
framed mobile shots, and writes the final PNGs into `public/assets/screenshots`.
See the script header for env overrides (`APP_URL`, `OUT_DIR`, `CHROME_EXE`, …).

## Firebase Hosting

This repo is configured for a Firebase Hosting target named `riverlaunch-prod`
in the `river-go-prod` Firebase project. The configured site id is
`riverlaunch-app`.

## Analytics Config

Analytics is consent-gated and disabled unless `public/assets/analytics-config.js`
contains a Firebase/GA measurement ID. Generate that file at build/deploy time:

```sh
RIVERLAUNCH_FIREBASE_MEASUREMENT_ID=G-7WSED71W56 node scripts/build-analytics-config.mjs
```

The same script also accepts `VITE_FIREBASE_MEASUREMENT_ID` or
`NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` for compatibility with app-style
environment names.

If the site has not been created yet:

```sh
firebase hosting:sites:create riverlaunch-app --project river-go-prod
firebase target:apply hosting riverlaunch-prod riverlaunch-app --project river-go-prod
```

Then deploy:

```sh
firebase deploy --only hosting:riverlaunch-prod --project river-go-prod
```
