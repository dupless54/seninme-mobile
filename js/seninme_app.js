/* @flow */
'use strict';

import { Linking } from 'react-native';
import './seninme_bootstrap';
import Discourse from './Discourse';
import { installPushPolicy } from './seninme_push_policy';
import {
  buildSharedTopicUrl,
  isSeninMeUrl,
  isUserApiAuthUrl,
  parseSeninMeUrl,
} from './seninme_links';

installPushPolicy(Discourse);

const originalHandleOpenUrl = Discourse.prototype._handleOpenUrl;
const originalOpenUrl = Discourse.prototype.openUrl;
const AUTH_REDIRECT_PARAMS = ['payload', 'otp', 'oneTimePassword'];

const buildLegacyAuthRedirectUrl = params => {
  const query = AUTH_REDIRECT_PARAMS.filter(
    key => typeof params[key] === 'string' && params[key].length > 0,
  )
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  return `discourse://auth_redirect${query ? `?${query}` : ''}`;
};

const openExternalUrl = url =>
  Linking.openURL(url).catch(error => {
    console.log(`Failed to open external URL ${url}`, error);
  });

Discourse.prototype._handleOpenUrl = function (event) {
  const url = event && event.url;

  if (typeof url !== 'string') {
    return;
  }

  const deepLink = parseSeninMeUrl(url);

  if (deepLink) {
    if (deepLink.route === 'auth_redirect') {
      return originalHandleOpenUrl.call(this, {
        ...event,
        // Never pass the raw custom-scheme query to the legacy parser. The
        // Senin.me parser already decoded valid values and ignored malformed
        // percent-encoding, so rebuild a small allowlisted query instead.
        url: buildLegacyAuthRedirectUrl(deepLink.params),
      });
    }

    if (deepLink.route === 'open') {
      const targetUrl = deepLink.params.url;
      if (isSeninMeUrl(targetUrl)) {
        this.openUrl(targetUrl);
      }
      return;
    }

    if (deepLink.route === 'share') {
      const sharedContent = deepLink.params.sharedUrl;
      if (sharedContent) {
        this.openUrl(buildSharedTopicUrl(sharedContent));
      }
      return;
    }

    // Unknown custom-scheme routes are ignored instead of falling through to
    // the upstream multi-site handler.
    return;
  }

  if (isSeninMeUrl(url)) {
    this.openUrl(url);
    return;
  }

  if (/^https?:\/\//i.test(url)) {
    openExternalUrl(url);
  }
};

Discourse.prototype.openUrl = function (url) {
  if (typeof url !== 'string') {
    return;
  }

  if (isSeninMeUrl(url) && !isUserApiAuthUrl(url)) {
    this._navigation.navigate('WebView', { url });
    return;
  }

  if (/^https?:\/\//i.test(url) && !isUserApiAuthUrl(url)) {
    openExternalUrl(url);
    return;
  }

  return originalOpenUrl.call(this, url);
};

export default Discourse;
