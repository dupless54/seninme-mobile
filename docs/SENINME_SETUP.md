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

Current foundation values:

- App name: `Senin.me`
- Site URL: `https://senin.me`
- URL scheme: `seninme`
- Auth callback: `seninme://auth_redirect`

The native Android application ID and iOS bundle identifier are intentionally left for a dedicated follow-up change because they affect signing, Firebase configuration, App Store Connect, Google Play, share extensions, and other native targets.

## Upstream strategy

Senin.me-specific runtime behavior is isolated in:

- `js/app_config.js`
- `js/seninme_bootstrap.js`
- `js/seninme_app.js`

This keeps the original DiscourseMobile implementation as close to upstream as possible and makes future upstream synchronization easier.
