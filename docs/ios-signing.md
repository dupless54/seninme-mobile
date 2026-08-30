# Senin.me iOS Signing

The Senin.me iOS application uses the following application identifiers:

- Main application: `me.senin.mobile`
- Share Extension: `me.senin.mobile.ShareExtension`

The repository intentionally does not commit an Apple Developer Team ID, provisioning profile UUID, Match profile name, signing certificate identity, APNs credential, or upstream Discourse signing configuration.

## Local and release signing

Before creating a device, TestFlight, or App Store build:

1. Open `ios/Discourse.xcworkspace` in Xcode after installing CocoaPods dependencies.
2. Select the application target and choose the Apple Developer team that owns `me.senin.mobile`.
3. Select the same team for the Share Extension target and ensure `me.senin.mobile.ShareExtension` is available to that team.
4. Keep automatic signing enabled unless the Senin.me release pipeline is later configured with explicit managed profiles.
5. Do not reuse Discourse.org provisioning profiles, certificates, or Team IDs.

## Push notifications

Remote push is intentionally disabled while the Senin.me push relay, Firebase/APNs configuration, and Discourse allowlist configuration are not available. The repository therefore does not currently request the `aps-environment` entitlement.

When the Senin.me push infrastructure is ready, add the Apple Push Notifications capability using the Senin.me Apple Developer team and configure the app-owned push relay before setting `APP_CONFIG.pushBaseUrl`.

## Associated domains

Universal Links, Handoff, and web credentials remain scoped to `senin.me`. The production site must serve the corresponding Apple App Site Association file for the final Senin.me Team ID and application identifier before Universal Links can be considered release-ready.
