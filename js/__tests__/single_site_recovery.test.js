/* @flow */
'use strict';

import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

describe('Senin.me single-site recovery', () => {
  test('uses the branded recovery screen before legacy onboarding', () => {
    const home = read('js/screens/HomeScreen.js');
    const recoveryIndex = home.indexOf('<Components.SingleSiteRecovery');
    const onboardingIndex = home.indexOf('<Components.OnBoardingView');

    expect(recoveryIndex).toBeGreaterThan(-1);
    expect(onboardingIndex).toBeGreaterThan(-1);
    expect(recoveryIndex).toBeLessThan(onboardingIndex);
  });

  test('synchronizes cached site state when Home mounts', () => {
    const home = read('js/screens/HomeScreen.js');

    expect(home).toContain('onChangeSites() {');
    expect(home).toContain('data: this._siteManager.listSites()');
    expect(home).not.toContain('if (e && e.event)');
  });

  test('can re-discover only the configured community', () => {
    const bootstrap = read('js/seninme_bootstrap.js');

    expect(bootstrap).toContain('retryConfiguredSite');
    expect(bootstrap).toContain('Site.fromTerm(APP_CONFIG.defaultSiteUrl)');
    expect(bootstrap).toContain('const isConfiguredSite = site =>');
    expect(
      bootstrap.match(/if \(!isConfiguredSite\(configuredSite\)\)/g),
    ).toHaveLength(2);
    expect(bootstrap).toContain('Ignoring redirected non-Senin.me site');
  });

  test('has localized recovery labels', () => {
    const en = JSON.parse(read('js/locale/en.json'));
    const tr = JSON.parse(read('js/locale/tr_TR.json'));

    expect(en.single_site_recovery_retry).toBeTruthy();
    expect(tr.single_site_recovery_retry).toBeTruthy();
    expect(en.single_site_recovery_description).toBeTruthy();
    expect(tr.single_site_recovery_description).toBeTruthy();
  });
});
