/* @flow */
'use strict';

import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

describe('Senin.me mobile privacy identity', () => {
  test('removes Android advertising identifier access', () => {
    const manifest = read('android/app/src/main/AndroidManifest.xml');

    expect(manifest).toContain(
      'android:name="com.google.android.gms.permission.AD_ID" tools:node="remove"',
    );
  });

  test('keeps inherited sensitive Android permissions removed', () => {
    const manifest = read('android/app/src/main/AndroidManifest.xml');

    [
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'READ_PHONE_STATE',
    ].forEach(permission => {
      expect(manifest).toContain(
        `android:name="android.permission.${permission}" tools:node="remove"`,
      );
    });
  });

  test('declares no app tracking in the iOS privacy manifest', () => {
    const privacyManifest = read('ios/Discourse/PrivacyInfo.xcprivacy');

    expect(privacyManifest).toContain('<key>NSPrivacyTracking</key>');
    expect(privacyManifest).toContain('<false/>');
    expect(privacyManifest).toContain('<key>NSPrivacyCollectedDataTypes</key>');
    expect(privacyManifest).toContain('<array/>');
  });
});
