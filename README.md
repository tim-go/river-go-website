# RiverLaunch.app Website

Static marketing website for RiverLaunch.app.

The site is intentionally plain HTML and CSS so Firebase Hosting can serve it
without a build step. Product screenshots are captured from the sibling
`../river-go` app and stored in `public/assets/screenshots`.

## Local preview

Open `public/index.html` in a browser, or run a local static server from this
repository if you want clean URL behaviour.

## Firebase Hosting

This repo is configured for a Firebase Hosting target named `riverlaunch-prod`
in the `river-go-prod` Firebase project. The configured site id is
`riverlaunch-app`.

If the site has not been created yet:

```sh
firebase hosting:sites:create riverlaunch-app --project river-go-prod
firebase target:apply hosting riverlaunch-prod riverlaunch-app --project river-go-prod
```

Then deploy:

```sh
firebase deploy --only hosting:riverlaunch-prod --project river-go-prod
```
