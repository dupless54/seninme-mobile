/* @flow */
'use strict';

import APP_CONFIG from '../app_config';

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
});
