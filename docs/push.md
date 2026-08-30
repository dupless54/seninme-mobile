# Senin.me Mobile Push Policy

Senin.me remote push notifications are intentionally disabled until the app has a Senin.me-owned push relay, Firebase project, APNs configuration, and store signing identities.

The native Notifications screen remains available because it reads notification state from the authenticated Discourse API. Disabling OS push does not remove that screen.

## Current fail-closed state

While `APP_CONFIG.pushBaseUrl` is `null`:

- Android does not request `POST_NOTIFICATIONS`.
- Android removes `POST_NOTIFICATIONS`, `RECEIVE_BOOT_COMPLETED`, and `VIBRATE` from the merged manifest.
- Android Firebase packages remain installed in JavaScript dependencies for upstream compatibility, but React Native autolinking is disabled for both Firebase packages.
- The Android Firebase adapter has no static Firebase imports and returns no-op messaging handlers.
- The Google Services Gradle plugin is not configured or applied.
- iOS does not surface the inherited notification permission prompt.
- The inherited iOS background local-notification fallback is disabled.
- Stale notification callbacks from previous installs are ignored by the Senin.me runtime policy.

This keeps a development or first production build from asking users for a capability that Senin.me cannot yet deliver.

## Enabling push later

Push activation must be one reviewed change that configures the complete ownership chain. Do not enable only one layer.

Required pieces:

1. Deploy a Senin.me-owned push relay and allowlist it in Discourse under `allowed user api push urls`.
2. Set `APP_CONFIG.pushBaseUrl` to that relay.
3. Create and configure the Senin.me Firebase project for Android.
4. Restore Android React Native Firebase autolinking and the Firebase Messaging adapter.
5. Restore the Google Services Gradle plugin and provide the Senin.me `google-services.json` through the release environment.
6. Restore only the Android notification permissions actually required by the chosen Firebase Messaging implementation.
7. Configure Senin.me-owned APNs capabilities, certificates/keys, and provisioning for iOS.
8. Replace the disabled iOS notification runtime policy with the final permission-request UX.
9. Update App Store and Google Play privacy disclosures in the same release if the enabled behavior changes collected data or tracking declarations.
10. Run exact-head Linting, Jest, Android Build, and iOS tests before merge.

Never reuse upstream Discourse Firebase, APNs, Apple, Google Play, or push-relay credentials.
