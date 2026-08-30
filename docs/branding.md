# Senin.me Mobile Branding

The mobile app uses a small, source-controlled branding system so white-label identity does not depend on inherited Discourse artwork.

## Primary mark

The master app-icon artwork lives at:

- `branding/seninme-app-icon.svg`

The current primary brand color is crimson `#9D1B2C` with a white Senin.me mark.

## Android

Android uses native resources rather than inherited launcher PNGs on supported devices:

- adaptive launcher background: `@color/ic_launcher_background`
- adaptive launcher foreground: `@drawable/seninme_mark`
- launch background: `@color/splashBackground`
- launch mark: `@drawable/seninme_mark`

The project minimum Android version supports adaptive launcher icons, so the Senin.me XML resources are the canonical launcher identity.

## iOS

The iOS asset catalog contains three 1024 x 1024 app-icon renders:

- `seninme.png`
- `seninme_dark.png`
- `seninme_tinted.png`

`Contents.json` maps those files to the normal, dark, and tinted appearances. The launch screen uses a crimson background with the Senin.me wordmark and no inherited Discourse launch image.

## Regeneration

Treat `branding/seninme-app-icon.svg` as the source of truth. When the brand mark changes, regenerate all iOS icon appearances from the SVG at exactly 1024 x 1024 and keep the branding regression test green.

Do not restore inherited `discourse*.png` application icons, the old Discourse launch mark, or user-visible `Discourse` bundle names.
