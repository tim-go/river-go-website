# Deploying RiverLaunch.app

This website is a static Firebase Hosting site for `riverlaunch.app`.

The repository is currently configured for a Firebase Hosting target named
`riverlaunch-prod` and a Hosting site id named `riverlaunch-app`.

## Prerequisites

- Firebase CLI installed and authenticated.
- Permission to create or manage the production Firebase/GCP project.
- DNS access for `riverlaunch.app`.

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
firebase deploy --only hosting:riverlaunch-prod --project river-go-prod
```

The site deploys the contents of `public/`.

## Add the Custom Domain

After the first deploy, add `riverlaunch.app` in the Firebase Console:

1. Open the `river-go-prod` Firebase project.
2. Go to Hosting.
3. Select the `riverlaunch-app` site.
4. Choose Add custom domain.
5. Enter `riverlaunch.app`.
6. Add the DNS records Firebase provides at the domain registrar.

Firebase will serve `riverlaunch.app` once DNS verification and certificate
provisioning complete.
