# AGENTS.md — Senin.me Mobile Engineering Guide

This repository is a **single-site Senin.me mobile application** derived from the upstream open-source DiscourseMobile project. Treat upstream DiscourseMobile as the compatibility base, but preserve the Senin.me white-label security and product boundaries described here.

## Project identity

- App name: `Senin.me`
- Community: `https://senin.me`
- Runtime mode: single-site only
- Android application ID: `me.senin.mobile`
- iOS application bundle ID: `me.senin.mobile`
- iOS Share Extension bundle ID: `me.senin.mobile.ShareExtension`
- Custom URL scheme: `seninme`
- User API Key callback: `seninme://auth_redirect`
- React Native root component/internal Xcode project name may remain `Discourse` to minimize upstream divergence. Do not treat internal project names as store identity.

## Non-negotiable product and security invariants

1. **Do not restore multi-site product behavior in the Senin.me runtime.** `APP_CONFIG.singleSite` is the runtime boundary. Legacy multi-site code may remain for upstream compatibility but must not become reachable from the Senin.me UX.
2. **Only `https://senin.me` is an in-app community origin.** External HTTP(S) URLs must not fall through to the legacy add-site flow or become a stored community.
3. **Revalidate discovery results after redirects.** `Site.fromTerm()` may follow redirects; single-site startup, retry, and add paths must accept the result only when its normalized final URL is exactly the configured Senin.me URL.
4. **Keep auth callbacks fail-closed.** Malformed/decrypt-failed payloads, missing nonce/site/key data, nonce mismatches, malformed percent encoding, and replayed successful callbacks must not apply credentials or crash the app.
5. **Never pass a raw Senin.me custom-scheme query to the legacy Discourse callback parser.** Rebuild only the allowlisted `payload`, `otp`, and `oneTimePassword` parameters.
6. **Do not restore the upstream Discourse push relay.** `APP_CONFIG.pushBaseUrl` stays `null` until a Senin.me-owned push relay and platform credentials are deliberately activated. `https://api.discourse.org` must not be used by this white-label app.
7. **Push remains fail-closed until activation.** Firebase native autolinking, Android notification permissions, inherited iOS permission prompts, stale notification callbacks, and unused background notification capabilities stay disabled while `pushBaseUrl` is null.
8. **Do not commit signing or store secrets.** Apple Team IDs, App Store Connect keys, Match credentials/repositories, Android keystores/passwords, Google Play service-account JSON, Firebase credentials, APNs keys, and production signing fingerprints belong in environment variables or external secret/file storage.
9. **Never reuse upstream Discourse release identities or credentials.** Do not restore `org.discourse.DiscourseApp`, `com.discourse`, the Discourse Apple Team ID, `team@discourse.org`, or `discourse-org/discourse-mobile-keys`.
10. **Domain association is cryptographic release configuration.** Production `assetlinks.json` must use the final Play/app signing SHA-256 fingerprint; the AASA file must use the real Senin.me Apple Team ID. Never commit placeholder identities as if verified.

## Senin.me isolation layer

Prefer Senin.me-specific behavior in these files instead of broad upstream rewrites:

- `js/app_config.js` — app/site/scheme/push configuration
- `js/seninme_app.js` — deep-link and external-navigation overrides
- `js/seninme_bootstrap.js` — single-site SiteManager/auth/recovery overrides
- `js/seninme_links.js` — Senin.me URL parsing and origin boundaries
- `js/seninme_push_policy.js` — disabled-push runtime policy

Keep changes to upstream-heavy files as small as practical. This reduces future DiscourseMobile sync cost.

## Important application areas

- `js/Discourse.js` — upstream root navigation/lifecycle implementation
- `js/site_manager.js` — upstream site/auth/device machinery; Senin.me overrides parts in `seninme_bootstrap.js`
- `js/site.js` — Discourse site discovery/API model
- `js/screens/HomeScreen.js` — native Senin.me home and recovery routing
- `js/screens/NotificationsScreen.js` — authenticated native notification state
- `js/screens/WebViewScreenComponents/WebViewComponent.js` — in-app Senin.me WebView boundary
- `e2e/onboarding.test.js` — single-site native shell and WebView Detox coverage
- `e2e/topiclist.test.js` — topic-list Detox coverage
- `fastlane/` — Senin.me-only release automation
- `scripts/verify-domain-association.cjs` — production App Links/Universal Links verifier

## Authentication flow

The white-label auth flow is Discourse User API Key authentication, not a generic multi-site onboarding flow:

1. Senin.me generates an authorization URL for the configured community.
2. The callback target is `seninme://auth_redirect`.
3. The Senin.me deep-link parser validates/sanitizes the callback query.
4. The legacy parser receives only a rebuilt allowlisted callback URL.
5. The encrypted payload must decrypt and parse successfully.
6. Nonce, active nonce site, and API key must be valid.
7. On success, consume `_nonce` and `_nonceSite` before asynchronous refresh work so the callback cannot be replayed.

The Discourse server must allow `seninme://auth_redirect` in `allowed user api auth redirects`.

## Single-site recovery

When the configured community cannot be discovered, show the branded native recovery state rather than inherited add-community onboarding.

`retryConfiguredSite()` must:

- refuse operation outside single-site mode,
- refuse a second retry while recovery is already in flight,
- discover only `APP_CONFIG.defaultSiteUrl`,
- revalidate the final discovered URL after redirects,
- persist only a valid Senin.me site,
- emit the normal SiteManager change event when complete.

## Push policy

Remote push is intentionally disabled until Senin.me owns the complete infrastructure. While disabled:

- no `push_url` is added to User API Key authorization,
- Android Firebase modules are not native-autolinked,
- the Android Firebase adapter must not statically import Firebase,
- `POST_NOTIFICATIONS` is denied for both single and batched runtime permission requests,
- notification/boot/vibrate manifest permissions introduced by push dependencies are removed,
- the inherited iOS notification permission prompt is suppressed,
- inherited background-fetch/local-notification fallback is disabled,
- `aps-environment` and remote-notification/background-fetch capabilities must not be reintroduced accidentally.

Push activation must be one reviewed change covering the Senin.me relay, Discourse allowlist, Firebase/APNs ownership, native linkage, permissions, signing/provisioning, background capabilities, tests, and store privacy disclosures.

## Build and release identity

### Android

- Min SDK: 26
- Target/compile SDK: 35
- Application ID: `me.senin.mobile`
- Gradle build files are Groovy-based in this repository.
- Release signing values are passed at runtime; do not write secrets into `gradle.properties` or copy keystores into the repository.

### iOS

- Main bundle ID: `me.senin.mobile`
- Share Extension: `me.senin.mobile.ShareExtension`
- Automatic signing is used in the project; real device/TestFlight/App Store builds require the Senin.me-owned Apple Developer team.
- Remote push entitlement stays absent until push activation.
- Associated domains stay scoped to `senin.me`.

See:

- `docs/ios-signing.md`
- `docs/release.md`
- `docs/domain-association.md`
- `docs/privacy-release.md`
- `docs/push.md`
- `docs/SENINME_SETUP.md`

## Testing and formatting

Use repository-owned tool versions and commands:

```bash
yarn
yarn eslint
yarn prettier
yarn test:unit
```

For iOS Detox:

```bash
yarn detox build --configuration ios.sim.debug
yarn detox test --configuration ios.sim.debug
```

Current CI includes:

- Linting / Prettier
- Jest
- Android debug build
- iOS Release-simulator Detox on iPhone 16 Pro and iPad (10th generation)

The iOS workflow intentionally skips intermediate stacked PRs whose base is not `main`. **A skipped stacked iOS run is not merge validation.**

## PR and CI discipline

For the phased Senin.me stack:

- keep each feature PR narrowly scoped,
- preserve earlier-phase fixes when synchronizing downstream branches,
- after the parent phase merges, align the next PR with the latest `main`,
- verify its diff still contains only the intended phase files,
- trigger fresh workflows on the final exact PR head,
- require Lint, Jest, Android Build, and real iPhone/iPad Detox success on that exact `main`-based head before merge,
- do not treat checks from an older SHA, a temporary sync PR, or a stacked/skipped iOS run as sufficient,
- use expected-head protection when merging so a moved PR head cannot be merged accidentally.

Temporary sync PRs are acceptable for non-destructive history alignment when they preserve feature scope. Close or merge them promptly so the open PR list remains clean.

## Android E2E note

`.detoxrc.js` already contains Android configurations, but the current Android CI gate is a build-only gate. Do not claim Android device/emulator E2E coverage until the Detox Android instrumentation dependency/runner and emulator workflow are explicitly added and proven green.

## Upstream maintenance

When syncing from upstream DiscourseMobile:

- prefer upstream implementation where it does not violate Senin.me invariants,
- reapply/verify the Senin.me isolation layer after conflict resolution,
- search for resurrected Discourse identifiers, push relay URLs, multi-site entry points, and signing credentials,
- rerun the complete exact-head CI matrix after the sync.

If an upstream change conflicts with a Senin.me security invariant, preserve the invariant and document the compatibility adjustment rather than silently restoring upstream behavior.
