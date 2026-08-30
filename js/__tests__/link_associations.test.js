/* @flow */
'use strict';

import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  generateAssociationFiles,
  normalizeFingerprint,
} from '../../scripts/generate-link-associations';

const fingerprint = Array(32).fill('AB').join(':');

describe('Senin.me verified link associations', () => {
  test('normalizes Android SHA-256 fingerprints', () => {
    expect(normalizeFingerprint('ab'.repeat(32))).toBe(fingerprint);
  });

  test('generates Apple and Android association files for Senin.me', () => {
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seninme-links-'));
    const result = generateAssociationFiles({
      teamId: 'ABCDE12345',
      fingerprint,
      outputDir,
    });

    const apple = JSON.parse(fs.readFileSync(result.applePath, 'utf8'));
    const android = JSON.parse(fs.readFileSync(result.androidPath, 'utf8'));

    expect(apple.applinks.details[0].appID).toBe(
      'ABCDE12345.me.senin.mobile',
    );
    expect(apple.applinks.details[0].paths).toEqual(['*']);
    expect(apple.webcredentials.apps).toEqual([
      'ABCDE12345.me.senin.mobile',
    ]);
    expect(android[0].target.package_name).toBe('me.senin.mobile');
    expect(android[0].target.sha256_cert_fingerprints).toEqual([fingerprint]);
  });

  test('keeps native link declarations on senin.me', () => {
    const manifest = fs.readFileSync(
      path.resolve('android/app/src/main/AndroidManifest.xml'),
      'utf8',
    );
    const entitlements = fs.readFileSync(
      path.resolve('ios/Discourse/Discourse.entitlements'),
      'utf8',
    );

    expect(manifest).toContain('android:host="senin.me"');
    expect(entitlements).toContain('applinks:senin.me');
    expect(entitlements).toContain('webcredentials:senin.me');
  });
});
