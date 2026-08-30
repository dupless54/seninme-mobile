/* @flow */
'use strict';

import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../..');
const readText = relativePath =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const androidManifest = readText('android/app/src/main/AndroidManifest.xml');
const iosEntitlements = readText('ios/Discourse/Discourse.entitlements');
const verifier = readText('scripts/verify-domain-association.cjs');
const packageJson = readText('package.json');

describe('Senin.me verified domain association', () => {
  test('locks native HTTPS association to senin.me', () => {
    expect(androidManifest).toContain('android:autoVerify="true"');
    expect(androidManifest).toContain(
      '<data android:scheme="https" android:host="senin.me" />',
    );
    expect(iosEntitlements).toContain('<string>applinks:senin.me</string>');
  });

  test('verifies only the Senin.me production application identities', () => {
    expect(verifier).toContain("const DOMAIN = 'senin.me'");
    expect(verifier).toContain("const ANDROID_PACKAGE = 'me.senin.mobile'");
    expect(verifier).toContain("const IOS_BUNDLE_ID = 'me.senin.mobile'");
    expect(verifier).toContain('SENINME_ANDROID_SHA256_CERT_FINGERPRINT');
    expect(verifier).toContain('SENINME_IOS_TEAM_ID');
  });

  test('exposes an explicit production verification command', () => {
    expect(packageJson).toContain('"verify:domain-association"');
    expect(packageJson).toContain('scripts/verify-domain-association.cjs');
  });
});
