/* @flow */
'use strict';

import './seninme_bootstrap';
import Discourse from './Discourse';
import APP_CONFIG from './app_config';

const originalHandleOpenUrl = Discourse.prototype._handleOpenUrl;
const originalOpenUrl = Discourse.prototype.openUrl;
const siteUrl = APP_CONFIG.defaultSiteUrl.replace(/\/+$/, '');

const isSeninMeUrl = url =>
  url === siteUrl ||
  url.startsWith(`${siteUrl}/`) ||
  url.startsWith(`${siteUrl}?`) ||
  url.startsWith(`${siteUrl}#`);

Discourse.prototype._handleOpenUrl = function (event) {
  if (
    event &&
    event.url &&
    event.url.startsWith(`${APP_CONFIG.customScheme}://`)
  ) {
    return originalHandleOpenUrl.call(this, {
      ...event,
      url: event.url.replace(`${APP_CONFIG.customScheme}://`, 'discourse://'),
    });
  }

  return originalHandleOpenUrl.call(this, event);
};

Discourse.prototype.openUrl = function (url) {
  if (typeof url === 'string' && isSeninMeUrl(url)) {
    this._navigation.navigate('WebView', { url });
    return;
  }

  return originalOpenUrl.call(this, url);
};

export default Discourse;
