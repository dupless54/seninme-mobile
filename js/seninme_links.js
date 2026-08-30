/* @flow */
'use strict';

import APP_CONFIG from './app_config';

const siteUrl = APP_CONFIG.defaultSiteUrl.replace(/\/+$/, '');
const schemePrefix = `${APP_CONFIG.customScheme}://`;

export const isSeninMeUrl = url =>
  typeof url === 'string' &&
  (url === siteUrl ||
    url.startsWith(`${siteUrl}/`) ||
    url.startsWith(`${siteUrl}?`) ||
    url.startsWith(`${siteUrl}#`));

export const isUserApiAuthUrl = url =>
  typeof url === 'string' &&
  (url === `${siteUrl}/user-api-key/new` ||
    url.startsWith(`${siteUrl}/user-api-key/new?`));

export const buildSharedTopicUrl = sharedUrl =>
  `${siteUrl}/new-topic?body=${encodeURIComponent(sharedUrl)}`;

export const parseSeninMeUrl = url => {
  if (typeof url !== 'string' || !url.startsWith(schemePrefix)) {
    return null;
  }

  const raw = url.slice(schemePrefix.length);
  const queryIndex = raw.indexOf('?');
  const route = queryIndex === -1 ? raw : raw.slice(0, queryIndex);
  const query = queryIndex === -1 ? '' : raw.slice(queryIndex + 1);
  const params = {};

  query
    .split('&')
    .filter(Boolean)
    .forEach(pair => {
      const separator = pair.indexOf('=');
      const key = separator === -1 ? pair : pair.slice(0, separator);
      const value = separator === -1 ? '' : pair.slice(separator + 1);

      try {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      } catch (_error) {
        // Ignore malformed deep-link parameters rather than falling back to
        // the upstream multi-site URL handler.
      }
    });

  return { route, params };
};

export const toLegacyDiscourseUrl = url =>
  url.replace(schemePrefix, 'discourse://');
