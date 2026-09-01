/* @flow */
'use strict';

import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../..');
const readText = relativePath =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const androidManifest = readText('android/app/src/main/AndroidManifest.xml');
const iosEntitlements = readText('ios/Discourse/Discourse.entitlements');
const iosSigningGuide = readText('docs/ios-signing.md');
const setupGuide = readText('docs/SENINME_SETUP.md');
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
    expect(verifier).toContain('SENINME_IOS_APP_IDENTIFIER_PREFIX');
    expect(verifier).not.toContain('SENINME_IOS_TEAM_ID');
  });

  test('validates production signing identifiers before verification', () => {
    expect(verifier).toContain('/^[A-F0-9]{64}$/');
    expect(verifier).toContain('function requireAppleAppIdentifierPrefix()');
    expect(verifier).toContain('/^[A-Za-z0-9]{10}$/');
    expect(verifier).toContain(
      'const expectedAppId = `${appIdentifierPrefix}.${IOS_BUNDLE_ID}`',
    );
  });

  test('requires direct JSON association responses', () => {
    expect(verifier).toContain('const JSON_CONTENT_TYPE = /^application\\/json\\b/i');
    expect(verifier).toContain("response.headers['content-type'] || ''");
    expect(verifier).toContain('association JSON must be served as application/json');
    expect(verifier).toContain('response.statusCode !== 200');
  });

  test('requires universal-link coverage for every Senin.me path', () => {
    expect(verifier).toContain('function enablesAllApplePaths(detail)');
    expect(verifier).toContain('/^NOT\\s+/i.test(path.trim())');
    expect(verifier).toContain(
      'components.some(component => component?.exclude === true)',
    );
    expect(verifier).toContain('hasAllPaths && !hasExclusion');
  });

  test('documents that signing Team ID is not the AASA prefix', () => {
    expect(iosSigningGuide).toContain(
      'SENINME_IOS_TEAM_ID` is a signing/provisioning identity',
    );
    expect(iosSigningGuide).toContain('App Identifier Prefix');
    expect(iosSigningGuide).toContain(
      'Do not substitute the Team ID for the App Identifier Prefix',
    );
    expect(setupGuide).toContain('APP_IDENTIFIER_PREFIX.me.senin.mobile');
    expect(setupGuide).toContain('SENINME_IOS_APP_IDENTIFIER_PREFIX');
    expect(setupGuide).toContain(
      'Do not assume this prefix equals the Apple Developer Team ID',
    );
  });

  test('exposes an explicit production verification command', () => {
    expect(packageJson).toContain('"verify:domain-association"');
    expect(packageJson).toContain('scripts/verify-domain-association.cjs');
  });
});
