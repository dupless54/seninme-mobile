/* @flow */
'use strict';

import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../..');
const readText = relativePath =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
const appIconDir = path.join(
  repoRoot,
  'ios/Discourse/Images.xcassets/AppIcon.appiconset',
);

const iosInfo = readText('ios/Discourse/Info.plist');
const shareInfo = readText('ios/ShareExtension/Info.plist');
const settingsBundle = readText('ios/Settings.bundle/Root.plist');
const iosLaunchScreen = readText('ios/Discourse/Base.lproj/LaunchScreen.xib');
const androidLauncher = readText(
  'android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
);
const androidRoundLauncher = readText(
  'android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml',
);
const androidSplash = readText(
  'android/app/src/main/res/drawable/launch_screen_bitmap.xml',
);
const appIconContents = readText(
  'ios/Discourse/Images.xcassets/AppIcon.appiconset/Contents.json',
);

describe('Senin.me application branding', () => {
  test('keeps user-visible iOS metadata on Senin.me', () => {
    expect(iosInfo).toContain(
      '<key>CFBundleName</key>\n\t<string>Senin.me</string>',
    );
    expect(shareInfo).toContain(
      '<key>CFBundleDisplayName</key>\n\t<string>Senin.me</string>',
    );
    expect(shareInfo).not.toContain('<string>Discourse</string>');
    expect(iosInfo).not.toContain('NSLocationWhenInUseUsageDescription');
    expect(iosInfo).not.toContain('<string>remote-notification</string>');
  });

  test('removes the obsolete iOS external-link system preference', () => {
    expect(settingsBundle).not.toContain('external_links_svc');
    expect(settingsBundle).toContain('<array/>');
  });

  test('uses Senin.me launch branding on both platforms', () => {
    expect(iosLaunchScreen).toContain('text="Senin.me"');
    expect(iosLaunchScreen).not.toContain('nav-icon-gray');
    expect(androidLauncher).toContain('@drawable/seninme_mark');
    expect(androidRoundLauncher).toContain('@drawable/seninme_mark');
    expect(androidSplash).toContain('@drawable/seninme_mark');
  });

  test('ships Senin.me iOS app icons in every supported appearance', () => {
    const filenames = ['seninme.png', 'seninme_dark.png', 'seninme_tinted.png'];
    const legacyFilenames = [
      'discourse.png',
      'discourse_dark.png',
      'discourse_tinted.png',
    ];

    expect(appIconContents).not.toContain('discourse');

    legacyFilenames.forEach(filename => {
      expect(fs.existsSync(path.join(appIconDir, filename))).toBe(false);
    });

    filenames.forEach(filename => {
      expect(appIconContents).toContain(`"filename": "${filename}"`);

      const icon = fs.readFileSync(path.join(appIconDir, filename));
      expect(icon.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
      expect(icon.readUInt32BE(16)).toBe(1024);
      expect(icon.readUInt32BE(20)).toBe(1024);
    });
  });
});
