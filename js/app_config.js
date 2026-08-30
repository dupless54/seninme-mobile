/* @flow */
'use strict';

const APP_CONFIG = Object.freeze({
  appName: 'Senin.me',
  defaultSiteUrl: 'https://senin.me',
  singleSite: true,
  customScheme: 'seninme',
  authRedirectUrl: 'seninme://auth_redirect',

  // White-label builds must use their own push relay. Keep this null until
  // the Senin.me push gateway is deployed and allowlisted in Discourse.
  pushBaseUrl: null,
});

export default APP_CONFIG;
