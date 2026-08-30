# Senin.me Mobile Privacy Release Notes

Senin.me Mobile should request only capabilities required by the community experience and configured release features.

## Android

The manifest explicitly removes inherited permissions that the Senin.me app does not need:

- `READ_EXTERNAL_STORAGE`
- `WRITE_EXTERNAL_STORAGE`
- `READ_PHONE_STATE`
- `com.google.android.gms.permission.AD_ID`

`AD_ID` is removed with a manifest-merger rule so a transitive Google dependency cannot silently add advertising identifier access back to the final manifest.

Camera, Bluetooth, vibration, internet, and background-start capabilities remain because they support existing media, browser, notification/background-fetch, or communication behavior in the upstream mobile shell.

## iOS

The application privacy manifest currently declares:

- tracking: `false`
- collected data types: none at the native application layer
- required-reason API categories used by the app/runtime

Do not add tracking declarations or advertising identifiers unless the product intentionally adopts a feature that requires them and the App Store / Play Store privacy disclosures are updated at the same time.

## Push notifications

Remote push remains disabled until Senin.me-owned APNs/Firebase credentials and the Senin.me push relay are configured. Push enablement should be handled as a separate reviewed change so notification permissions and store privacy declarations remain synchronized with the actual feature state.
