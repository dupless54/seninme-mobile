/* @flow */
'use strict';

import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../..');
const readText = relativePath =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const appConfig = readText('js/app_config.js');
const pushPolicy = readText('js/seninme_push_policy.js');
const appAdapter = readText('js/seninme_app.js');
const firebaseAdapter = readText('js/platforms/firebase.android.js');
const reactNativeConfig = readText('react-native.config.js');
const androidManifest = readText('android/app/src/main/AndroidManifest.xml');
const androidRootGradle = readText('android/build.gradle');
const androidAppGradle = readText('android/app/build.gradle');

describe('Senin.me disabled push policy', () => {
  test('keeps remote push disabled in application configuration', () => {
    expect(appConfig).toContain('pushBaseUrl: null');
    expect(appAdapter).toContain('installPushPolicy(Discourse)');
  });

  test('blocks inherited notification permission prompts and background alerts', () => {
    expect(pushPolicy).toContain(
      'permission === PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS',
    );
    expect(pushPolicy).toContain('PushNotificationIOS.requestPermissions');
    expect(pushPolicy).toContain(
      'DiscourseClass.prototype._initBackgroundFetch = async function () {}',
    );
    expect(pushPolicy).toContain(
      'DiscourseClass.prototype._handleNotification = function () {}',
    );
  });

  test('does not initialize Firebase Messaging while push is disabled', () => {
    expect(firebaseAdapter).not.toContain("from '@react-native-firebase/app'");
    expect(firebaseAdapter).not.toContain("'@react-native-firebase/messaging'");
    expect(reactNativeConfig.match(/android: null/g) || []).toHaveLength(3);
    expect(androidRootGradle).not.toContain('com.google.gms:google-services');
    expect(androidAppGradle).not.toContain('com.google.gms.google-services');
  });

  test('removes dormant Android notification permissions and metadata', () => {
    [
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.VIBRATE',
    ].forEach(permission => {
      expect(androidManifest).toContain(
        `android:name="${permission}" tools:node="remove"`,
      );
    });

    expect(androidManifest).not.toContain(
      'com.google.firebase.messaging.default_notification_icon',
    );
  });
});
