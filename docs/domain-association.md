# Senin.me Domain Association

Senin.me uses verified HTTPS links so forum URLs can open directly in the native application without claiming any domain that the project does not control.

## Native identity

- Production domain: `senin.me`
- Android package: `me.senin.mobile`
- iOS bundle identifier: `me.senin.mobile`
- Android manifest: `android:autoVerify="true"` for `https://senin.me`
- iOS entitlement: `applinks:senin.me`

The application-side declarations are only half of the trust relationship. The `senin.me` web server must publish matching association documents.

## Android Digital Asset Links

Publish this file without a redirect:

`https://senin.me/.well-known/assetlinks.json`

The production statement must authorize:

- namespace `android_app`
- package `me.senin.mobile`
- relation `delegate_permission/common.handle_all_urls`
- the SHA-256 certificate fingerprint of the **release** signing key

Do not use the debug keystore fingerprint for production association.

Example shape:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "me.senin.mobile",
      "sha256_cert_fingerprints": ["RELEASE_CERTIFICATE_SHA256"]
    }
  }
]
```

If Google Play App Signing is enabled, use the SHA-256 fingerprint of the app-signing certificate that Google Play actually uses to sign distributed builds, not merely the local upload key.

## Apple Associated Domains

Publish this file without a redirect or filename extension:

`https://senin.me/.well-known/apple-app-site-association`

Its `applinks.details` section must authorize the application identifier formed from the Apple Developer Team ID and bundle identifier:

`APPLE_TEAM_ID.me.senin.mobile`

Senin.me intends forum HTTPS URLs across the site to open in the app, so the matching detail must also authorize all paths. The verifier accepts the legacy `paths` form with `"*"` or `"/*"`, or the modern `components` form with an equivalent non-excluded `/` rule.

Example shape:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "APPLE_TEAM_ID.me.senin.mobile",
        "paths": ["*"]
      }
    ]
  }
}
```

The real Apple Team ID is intentionally not stored in this repository.

## Verification command

After the production signing identities are available, export:

```bash
export SENINME_ANDROID_SHA256_CERT_FINGERPRINT="AA:BB:..."
export SENINME_IOS_TEAM_ID="YOURTEAMID"
yarn verify:domain-association
```

The verifier fetches both production association endpoints and fails unless:

1. both endpoints return HTTP 200 directly;
2. `assetlinks.json` authorizes `me.senin.mobile` for `handle_all_urls` with the configured release fingerprint;
3. the Apple association document authorizes `TEAM_ID.me.senin.mobile` and actually enables all Senin.me paths for that application.

Run this check whenever the Android signing certificate, Apple Developer team, domain routing, CDN, reverse proxy, or association documents change.

## Deployment rule

Association files are security-sensitive deployment configuration. They belong on the `senin.me` origin/CDN configuration, not inside the mobile application bundle. Never publish guessed Team IDs or signing fingerprints merely to make verification pass.