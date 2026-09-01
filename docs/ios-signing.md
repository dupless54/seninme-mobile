# Senin.me iOS Signing

The Senin.me iOS application uses the following application identifiers:

- Main application: `me.senin.mobile`
- Share Extension: `me.senin.mobile.ShareExtension`

The repository intentionally does not commit an Apple Developer Team ID, App Identifier Prefix, provisioning profile UUID, Match profile name, signing certificate identity, APNs credential, or upstream Discourse signing configuration.

## Local and release signing

Before creating a device, TestFlight, or App Store build:

1. Open `ios/Discourse.xcworkspace` in Xcode after installing CocoaPods dependencies.
2. Select the application target and choose the Apple Developer team that owns `me.senin.mobile`.
3. Select the same team for the Share Extension target and ensure `me.senin.mobile.ShareExtension` is available to that team.
4. Keep automatic signing enabled unless the Senin.me release pipeline is later configured with explicit managed profiles.
5. Do not reuse Discourse.org provisioning profiles, certificates, or Team IDs.

The committed Xcode project deliberately leaves `DEVELOPMENT_TEAM` unset. Automatic signing becomes release-usable only after a Senin.me-owned Apple Developer team is selected locally or injected by the release pipeline.

`SENINME_IOS_TEAM_ID` identifies the Apple Developer team for signing and provisioning. It is not automatically the value that belongs at the front of the AASA `appID`. The AASA value uses the app's **App Identifier Prefix**, which must be confirmed from the production application identifier or the signed app's `application-identifier` entitlement. Existing Apple identifiers can have a prefix that differs from the Team ID.

## Push notifications

Remote push is intentionally disabled while the Senin.me push relay, Firebase/APNs configuration, and Discourse allowlist configuration are not available. The repository therefore does not currently request the `aps-environment` entitlement.

When the Senin.me push infrastructure is ready, add the Apple Push Notifications capability using the Senin.me Apple Developer team and configure the app-owned push relay before setting `APP_CONFIG.pushBaseUrl`.

## Associated domains

Universal Links remain scoped to `senin.me`. Before Universal Links can be considered release-ready:

1. confirm the production App Identifier Prefix for `me.senin.mobile`;
2. publish the AASA application ID as `APP_IDENTIFIER_PREFIX.me.senin.mobile`;
3. ensure the matching AASA detail covers all intended Senin.me paths without exclusions;
4. run `yarn verify:domain-association` with `SENINME_IOS_APP_IDENTIFIER_PREFIX` and the production Android signing fingerprint.

Do not substitute the Team ID for the App Identifier Prefix unless the production identifier proves they are identical.
