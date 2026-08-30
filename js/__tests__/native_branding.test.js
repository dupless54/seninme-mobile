/* @flow */
'use strict';

import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../..');
const read = relativePath =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const appInfo = read('ios/Discourse/Info.plist');
const shareInfo = read('ios/ShareExtension/Info.plist');
const settingsInfo = read('ios/Settings.bundle/Root.plist');
const androidStrings = read('android/app/src/main/res/values/strings.xml');

describe('Senin.me native branding', () => {
  test('uses Senin.me on native application surfaces', () => {
    expect(appInfo).toContain('<string>Senin.me</string>');
    expect(shareInfo).toContain('<string>Senin.me</string>');
    expect(shareInfo).toContain('<string>Senin.me Share</string>');
    expect(settingsInfo).toContain('Open external links in Senin.me');
    expect(androidStrings).toContain('<string name="app_name">Senin.me</string>');
  });

  test('does not expose the upstream brand in iOS bundle metadata', () => {
    expect(appInfo).not.toContain('<string>Discourse</string>');
    expect(shareInfo).not.toContain('<string>Discourse</string>');
  });
});
