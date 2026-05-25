# RiverLaunch.app Website

Static marketing website for RiverLaunch.app.

The site is intentionally plain HTML, CSS, and small vanilla JavaScript files so
Firebase Hosting can serve it without a bundler. Product screenshots are
captured from the sibling `../river-go` app and stored in
`public/assets/screenshots`.

## Local preview

Open `public/index.html` in a browser, or run a local static server from this
repository if you want clean URL behaviour.

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
