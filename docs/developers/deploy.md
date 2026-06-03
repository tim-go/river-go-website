# Deploying RiverLaunch.info

This website is a static Firebase Hosting site for `riverlaunch.info`.

The repository is currently configured for a Firebase Hosting target named
`riverlaunch-prod` and a Hosting site id named `riverlaunch-app`.

## Prerequisites

- Firebase CLI installed and authenticated.
- Permission to create or manage the production Firebase/GCP project.
- DNS access for `riverlaunch.info`.

```sh
firebase login
```

## Create the Production Firebase Project

If the production project does not exist yet, create it first:

```sh
firebase projects:create river-go-prod --display-name "River Go Production"
firebase use --add river-go-prod
```

Firebase/GCP project IDs are globally unique. If `river-go-prod` is not
available, choose another project ID and update `.firebaserc` in this repository
to match.

## Create the Hosting Site and Target

Create the Firebase Hosting site:

```sh
firebase hosting:sites:create riverlaunch-app --project river-go-prod
```

Attach the site to the local deploy target:

```sh
firebase target:apply hosting riverlaunch-prod riverlaunch-app --project river-go-prod
```

## Deploy

From the repository root:

```sh
RIVERLAUNCH_FIREBASE_MEASUREMENT_ID=G-7WSED71W56 node scripts/build-analytics-config.mjs
firebase deploy --only hosting:riverlaunch-prod --project river-go-prod
```

The site deploys the contents of `public/`. `G-7WSED71W56` is the production
Firebase/GA measurement ID for the RiverLaunch marketing Web App in
`river-go-prod`.

If you are deploying a staging marketing copy and want it to report into the
existing RiverLaunch staging GA property, use:

```sh
RIVERLAUNCH_FIREBASE_MEASUREMENT_ID=G-WVKM71E8VW node scripts/build-analytics-config.mjs
firebase deploy --only hosting:riverlaunch-prod --project river-go-prod
```

Do not use the staging measurement ID for the production `riverlaunch.info`
domain once a production marketing web stream exists.

## Analytics Consent

The marketing site loads Google Analytics only after the visitor chooses
`Allow analytics` in the consent banner. The default state is denied; choosing
`Not now` stores a declined state and does not initialise GA.

The analytics config is generated into `public/assets/analytics-config.js`. If
no measurement ID is provided, the banner is hidden and analytics remains
disabled.

Tracked events are deliberately limited to page views, preview-app CTA clicks,
and lead/contact CTA clicks. Do not send personal information such as email
addresses, names, phone numbers, free-text form content, emergency details, or
exact home/location data.

After deploy:

1. Hard refresh the marketing site.
2. Accept analytics.
3. Open GA Realtime or DebugView for the configured property.
4. Trigger a page view and preview-app CTA click.
5. Confirm `page_view`, `select_content`, and contact `generate_lead` events arrive.

## Add the Custom Domain

After the first deploy, add `riverlaunch.info` in the Firebase Console:

1. Open the `river-go-prod` Firebase project.
2. Go to Hosting.
3. Select the `riverlaunch-app` site.
4. Choose Add custom domain.
5. Enter `riverlaunch.info`.
6. Add the DNS records Firebase provides at the domain registrar.

Firebase will serve `riverlaunch.info` once DNS verification and certificate
provisioning complete.
