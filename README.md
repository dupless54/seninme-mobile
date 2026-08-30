# Senin.me Mobile

Native iOS and Android client for the Senin.me community, based on the open-source [DiscourseMobile](https://github.com/discourse/DiscourseMobile) project.

This fork is being adapted as a single-site white-label application for `https://senin.me` while keeping Senin.me-specific behavior isolated from upstream code wherever practical.

## Current foundation

- Senin.me application branding
- fixed single-site configuration for `https://senin.me`
- `seninme://auth_redirect` User API Key callback
- multi-site add/remove behavior disabled in the Senin.me runtime
- official Discourse push relay disabled for the white-label build
- Android and iOS display names updated to Senin.me

See [`docs/SENINME_SETUP.md`](docs/SENINME_SETUP.md) for the required Discourse server settings and the planned push-notification setup.

## Development

Install Yarn and Watchman:

```bash
npm install -g yarn
brew install watchman
```

Install project dependencies:

```bash
yarn
```

On macOS, install the Ruby/CocoaPods dependencies:

```bash
bundle
pod install --project-directory=ios
```

Start Metro:

```bash
npx react-native start
```

Then run a platform build in another terminal:

```bash
npx react-native run-ios
# or
npx react-native run-android
```

For Android emulator development, localhost access may require:

```bash
adb reverse tcp:8081 tcp:8081
```

## Upstream and license

This project is derived from DiscourseMobile and retains its MIT license and required copyright notice. Upstream changes should be integrated with minimal changes to core DiscourseMobile files whenever possible.
