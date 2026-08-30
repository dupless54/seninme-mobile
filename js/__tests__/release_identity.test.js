/* @flow */
'use strict';

import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../..');
const fastfile = fs.readFileSync(
  path.join(repoRoot, 'fastlane/Fastfile'),
  'utf8',
);
const matchfile = fs.readFileSync(
  path.join(repoRoot, 'fastlane/Matchfile'),
  'utf8',
);
const releaseConfig = `${fastfile}\n${matchfile}`;

describe('Senin.me release identity', () => {
  test('does not reference upstream Discourse release credentials', () => {
    const forbiddenValues = [
      'discourse-org/discourse-mobile-keys',
      'team@discourse.org',
      '6T3LU73T8S',
      'org.discourse.DiscourseApp',
      'package_name "com.discourse"',
    ];

    forbiddenValues.forEach(value => {
      expect(releaseConfig).not.toContain(value);
    });
  });

  test('locks release identifiers to Senin.me', () => {
    expect(fastfile).toContain('IOS_APP_IDENTIFIER = "me.senin.mobile"');
    expect(fastfile).toContain(
      'IOS_SHARE_EXTENSION_IDENTIFIER = "me.senin.mobile.ShareExtension"',
    );
    expect(fastfile).toContain('ANDROID_PACKAGE_NAME = "me.senin.mobile"');
    expect(matchfile).toContain('"me.senin.mobile"');
    expect(matchfile).toContain('"me.senin.mobile.ShareExtension"');
  });

  test('requires app-owned release secret locations', () => {
    expect(fastfile).toContain('SENINME_MATCH_GIT_URL');
    expect(fastfile).toContain('SENINME_ASC_API_KEY_PATH');
    expect(fastfile).toContain('SENINME_IOS_TEAM_ID');
    expect(fastfile).toContain('SENINME_GOOGLE_PLAY_JSON_KEY');
    expect(fastfile).toContain('SENINME_ANDROID_KEYSTORE_PATH');
  });
});
