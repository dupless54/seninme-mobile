/* @flow */
'use strict';

import fs from 'fs';
import path from 'path';
import APP_CONFIG from '../app_config';

const root = path.resolve(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

describe('Senin.me white-label configuration', () => {
  test('uses the Senin.me site and callback scheme', () => {
    expect(APP_CONFIG.appName).toBe('Senin.me');
    expect(APP_CONFIG.defaultSiteUrl).toBe('https://senin.me');
    expect(APP_CONFIG.singleSite).toBe(true);
    expect(APP_CONFIG.customScheme).toBe('seninme');
    expect(APP_CONFIG.authRedirectUrl).toBe('seninme://auth_redirect');
  });

  test('does not use a push relay until Senin.me configures one', () => {
    expect(APP_CONFIG.pushBaseUrl).toBeNull();
  });

  test('fails closed for malformed or replayed auth callbacks', () => {
    const bootstrap = read('js/seninme_bootstrap.js');

    expect(bootstrap).toContain(
      'SiteManager.prototype.handleAuthPayload = function (payload)',
    );
    expect(bootstrap).toContain('Ignoring malformed Senin.me auth payload');
    expect(bootstrap).toContain("typeof decrypted.nonce !== 'string'");
    expect(bootstrap).toContain("typeof decrypted.key !== 'string'");
    expect(bootstrap).toContain('this._nonce = null;');
    expect(bootstrap).toContain('this._nonceSite = null;');
  });

  test('sanitizes auth redirect parameters before legacy parsing', () => {
    const app = read('js/seninme_app.js');

    expect(app).toContain(
      "const AUTH_REDIRECT_PARAMS = ['payload', 'otp', 'oneTimePassword']",
    );
    expect(app).toContain('buildLegacyAuthRedirectUrl(deepLink.params)');
    expect(app).not.toContain('toLegacyDiscourseUrl(url)');
  });
});
