# Senin.me Mobile Setup

This repository is a white-label, single-site derivative of the official DiscourseMobile application. The app is configured to connect only to `https://senin.me`.

## Discourse server settings

Before testing authentication, configure the Senin.me Discourse instance to allow the mobile callback URL:

- Site setting: `allowed user api auth redirects`
- Add: `seninme://auth_redirect`

Discourse validates User API Key callback URLs against this allowlist. Authentication will be rejected until the custom scheme is allowed.

## Push notifications

The official Discourse push relay must not be used by this white-label application. `js/app_config.js` therefore keeps `pushBaseUrl` set to `null` by default.

Until a Senin.me push gateway is deployed:

- User API Key authentication continues to work.
- The returned User API Key has push disabled.
- Native remote push notifications are not expected to work.

When the Senin.me push gateway is ready:

1. Add its base URL to the Discourse `allowed user api push urls` site setting.
2. Set `pushBaseUrl` in `js/app_config.js`.
3. Configure the Senin.me Firebase/APNs credentials for the Android and iOS builds.

## App identity

Current values:

- App name: `Senin.me`
- Site URL: `https://senin.me`
- Android application ID: `me.senin.mobile`
- iOS application bundle ID: `me.senin.mobile`
- iOS Share Extension bundle ID: `me.senin.mobile.ShareExtension`
- URL scheme: `seninme`
- Auth callback: `seninme://auth_redirect`

The Senin.me bundle identifiers are fixed in the project. The Apple Developer Team ID, signing certificates, and provisioning profiles still require the Senin.me-owned Apple Developer configuration before device, TestFlight, or App Store builds can be produced safely.

## Deep links and sharing

The native shell accepts only these Senin.me custom-scheme routes:

- `seninme://auth_redirect` for User API Key authentication.
- `seninme://open?url=...` for URLs whose origin is exactly `https://senin.me`.
- `seninme://share?sharedUrl=...` for opening shared URLs or text in a Senin.me new-topic composer.

Unknown custom-scheme routes are ignored. External HTTP(S) URLs never fall through to the upstream multi-site add flow.

### Android App Links

Android declares a verified App Link for `https://senin.me`. Verification requires Senin.me to serve:

`https://senin.me/.well-known/assetlinks.json`

The file must authorize package `me.senin.mobile` using the SHA-256 fingerprint of the final Play/App signing certificate. Do not publish a placeholder fingerprint.

### iOS Universal Links

iOS is scoped to the `senin.me` associated domain. Universal Links require Senin.me to serve:

`https://senin.me/.well-known/apple-app-site-association`

The matching AASA application identifier must be:

`APP_IDENTIFIER_PREFIX.me.senin.mobile`

Use the real 10-character **App Identifier Prefix** from the production application identifier / signed `application-identifier` entitlement. Do not assume this prefix equals the Apple Developer Team ID; existing Apple identifiers may use a different prefix. The Team ID remains the signing/provisioning identity, while the App Identifier Prefix is the value used in the AASA `appID`.

The matching AASA detail must cover the intended Senin.me paths without exclusions. Run `yarn verify:domain-association` with `SENINME_IOS_APP_IDENTIFIER_PREFIX` and the production Android signing fingerprint before treating verified links as release-ready.

## Validation

Pull requests should pass the repository's linting, Jest, Android build, and iOS workflows before being merged. Forks may require GitHub Actions to be explicitly enabled before pull-request workflow runs are created.

## Upstream strategy

Senin.me-specific runtime behavior is isolated primarily in:

- `js/app_config.js`
- `js/seninme_bootstrap.js`
- `js/seninme_app.js`
- `js/seninme_links.js`

This keeps the original DiscourseMobile implementation as close to upstream as practical and makes future upstream synchronization easier.
