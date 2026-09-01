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

The verifier normalizes colon-separated or plain hexadecimal fingerprints and then requires exactly 32 SHA-256 bytes (64 hexadecimal characters). Invalid or truncated fingerprints fail before the association documents are accepted.

## Apple Associated Domains

Publish this file without a redirect or filename extension:

`https://senin.me/.well-known/apple-app-site-association`

Its `applinks.details` section must authorize the application identifier formed from the app's **App Identifier Prefix** and bundle identifier:

`APP_IDENTIFIER_PREFIX.me.senin.mobile`

The App Identifier Prefix is the 10-character prefix in the production app identifier / `application-identifier` entitlement. Do not assume it is the Apple Developer Team ID: the two values are often identical for newer teams, but Apple explicitly allows them to differ for existing identifiers.

Senin.me intends forum HTTPS URLs across the site to open in the app, so the matching detail must authorize all paths. The verifier accepts the legacy `paths` form with `"*"` or `"/*"`, or the modern `components` form with an equivalent catch-all `/` rule.

Because the contract is **all Senin.me paths**, the verifier fails closed if the matching legacy `paths` array contains a `NOT ...` exclusion or if the matching modern `components` array contains any `exclude: true` component. A catch-all rule combined with an exclusion is not treated as full-site coverage.

Example shape:

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "APP_IDENTIFIER_PREFIX.me.senin.mobile",
        "paths": ["*"]
      }
    ]
  }
}
```

The real App Identifier Prefix is intentionally not stored in this repository. Confirm it from the production signing identity or the signed app's `application-identifier` entitlement before publishing the AASA file.

## Verification command

After the production signing identities are available, export:

```bash
export SENINME_ANDROID_SHA256_CERT_FINGERPRINT="AA:BB:..."
export SENINME_IOS_APP_IDENTIFIER_PREFIX="ABCDE12345"
yarn verify:domain-association
```

The verifier fetches both production association endpoints and fails unless:

1. both endpoints return HTTP 200 directly;
2. `assetlinks.json` authorizes `me.senin.mobile` for `handle_all_urls` with a valid configured release SHA-256 fingerprint;
3. the Apple association document authorizes `APP_IDENTIFIER_PREFIX.me.senin.mobile` without exclusions and actually enables every Senin.me path for that application.

Run this check whenever the Android signing certificate, Apple application identifier/signing identity, domain routing, CDN, reverse proxy, or association documents change.

## Deployment rule

Association files are security-sensitive deployment configuration. They belong on the `senin.me` origin/CDN configuration, not inside the mobile application bundle. Never publish guessed App Identifier Prefix values or signing fingerprints merely to make verification pass.
