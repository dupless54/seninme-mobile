/* @flow */
'use strict';

import './seninme_bootstrap';
import Discourse from './Discourse';
import APP_CONFIG from './app_config';

const originalHandleOpenUrl = Discourse.prototype._handleOpenUrl;

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

export default Discourse;
