/* @flow */
'use strict';

import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Site from './site';
import SiteManager from './site_manager';
import APP_CONFIG from './app_config';

const normalizeUrl = url => (url || '').replace(/\/+$/, '');
const configuredSiteUrl = normalizeUrl(APP_CONFIG.defaultSiteUrl);
const isConfiguredSite = site =>
  Boolean(site) && normalizeUrl(site.url) === configuredSiteUrl;

SiteManager.prototype.handleAuthPayload = function (payload) {
  let decrypted;

  try {
    const decryptedPayload = this.decryptHelper(payload);
    if (!decryptedPayload) {
      throw new Error('Unable to decrypt auth payload');
    }
    decrypted = JSON.parse(decryptedPayload);
  } catch (error) {
    console.log('Ignoring malformed Senin.me auth payload', error);
    return false;
  }

  if (
    !decrypted ||
    typeof decrypted !== 'object' ||
    typeof decrypted.nonce !== 'string' ||
    typeof decrypted.key !== 'string' ||
    decrypted.key.length === 0 ||
    !this._nonceSite
  ) {
    console.log('Ignoring invalid Senin.me auth payload');
    return false;
  }

  if (decrypted.nonce !== this._nonce) {
    Alert.alert('We were not expecting this reply, please try again!');
    return false;
  }

  const nonceSite = this._nonceSite;
  nonceSite.authToken = decrypted.key;
  nonceSite.hasPush = decrypted.push;
  nonceSite.apiVersion = decrypted.api;

  // Consume the nonce before any asynchronous work starts so the same
  // encrypted callback cannot be replayed successfully.
  this._nonce = null;
  this._nonceSite = null;

  this._onChange();

  nonceSite
    .refresh()
    .then(() => {
      this._onChange();
    })
    .catch(e => {
      console.log('Failed to refresh ' + nonceSite.url + ' ' + e);
    });

  return true;
};

SiteManager.prototype.load = function () {
  this._loading = true;
  this.customScheme = APP_CONFIG.customScheme;
  this.urlScheme = APP_CONFIG.authRedirectUrl;
  this.deviceName = `${APP_CONFIG.appName} - Mobile Device`;

  this.ensureRSAKeys();

  AsyncStorage.getItem('@Discourse.sites')
    .then(async json => {
      let storedSites = [];

      if (json) {
        try {
          storedSites = JSON.parse(json).map(obj => new Site(obj));
        } catch (error) {
          console.log('Failed to parse stored sites', error);
        }
      }

      if (!APP_CONFIG.singleSite) {
        this.sites = storedSites;
        return;
      }

      let configuredSite = storedSites.find(site => isConfiguredSite(site));

      if (!configuredSite) {
        configuredSite = await Site.fromTerm(APP_CONFIG.defaultSiteUrl);
      }

      if (!isConfiguredSite(configuredSite)) {
        if (configuredSite) {
          console.log(
            `Ignoring redirected non-Senin.me site ${configuredSite.url}`,
          );
        }
        this.sites = [];
        return;
      }

      configuredSite.createdAt = configuredSite.createdAt || Date.now();
      this.sites = [configuredSite];
      this.save();
      this.updateNativeMenu();

      try {
        const latestSite = await configuredSite.ensureLatestApi();
        if (latestSite) {
          configuredSite.apiVersion = latestSite.apiVersion;
          configuredSite.icon = latestSite.icon || configuredSite.icon;
          configuredSite.lastChecked = Date.now();
        }

        if (configuredSite.authToken) {
          await configuredSite.refresh();
        }
      } catch (error) {
        console.log('Failed to refresh configured Senin.me site', error);
      }
    })
    .catch(error => {
      console.log('Failed to initialize Senin.me site', error);
    })
    .finally(() => {
      this._loading = false;
      this._onChange();
    });
};

SiteManager.prototype.retryConfiguredSite = async function () {
  if (!APP_CONFIG.singleSite) {
    return false;
  }

  this._loading = true;
  this._onChange();

  try {
    const configuredSite = await Site.fromTerm(APP_CONFIG.defaultSiteUrl);

    if (!isConfiguredSite(configuredSite)) {
      if (configuredSite) {
        console.log(
          `Ignoring redirected non-Senin.me site ${configuredSite.url}`,
        );
      }
      this.sites = [];
      return false;
    }

    configuredSite.createdAt = Date.now();
    this.sites = [configuredSite];
    this.save();
    this.updateNativeMenu();

    try {
      const latestSite = await configuredSite.ensureLatestApi();
      if (latestSite) {
        configuredSite.apiVersion = latestSite.apiVersion;
        configuredSite.icon = latestSite.icon || configuredSite.icon;
        configuredSite.lastChecked = Date.now();
      }
    } catch (error) {
      console.log('Failed to refresh recovered Senin.me site', error);
    }

    return true;
  } catch (error) {
    console.log('Failed to recover configured Senin.me site', error);
    this.sites = [];
    return false;
  } finally {
    this._loading = false;
    this._onChange();
  }
};

SiteManager.prototype.add = function (site) {
  if (!APP_CONFIG.singleSite) {
    return;
  }

  if (!isConfiguredSite(site)) {
    console.log(`Ignoring non-Senin.me site ${site.url}`);
    return;
  }

  site.createdAt = site.createdAt || Date.now();
  this.sites = [site];
  this.save();
  this._onChange();
  this.updateNativeMenu();
};

SiteManager.prototype.remove = function () {
  if (APP_CONFIG.singleSite) {
    return;
  }
};

SiteManager.prototype.updateOrder = function () {
  if (APP_CONFIG.singleSite) {
    return;
  }
};

SiteManager.prototype.generateAuthURL = function (site) {
  let clientId;

  return this.ensureRSAKeys().then(() =>
    this.getClientId()
      .then(cid => {
        clientId = cid;
        return this.generateNonce(site);
      })
      .then(nonce => {
        const params = {
          scopes: 'notifications,session_info,one_time_password',
          client_id: clientId,
          nonce,
          auth_redirect: APP_CONFIG.authRedirectUrl,
          application_name: APP_CONFIG.appName,
          public_key: this.rsaKeys.public,
          discourse_app: 1,
        };

        if (APP_CONFIG.pushBaseUrl) {
          params.push_url = `${APP_CONFIG.pushBaseUrl.replace(
            /\/+$/,
            '',
          )}/api/publish_${Platform.OS}`;
        }

        return `${site.url}/user-api-key/new?${this.serializeParams(params)}`;
      }),
  );
};

SiteManager.prototype.generateURLParams = function (site, type = 'basic') {
  return this.ensureRSAKeys().then(() => {
    let params = {
      auth_redirect: APP_CONFIG.authRedirectUrl,
      user_api_public_key: this.rsaKeys.public,
    };

    if (type === 'full') {
      params = {
        auth_redirect: APP_CONFIG.authRedirectUrl,
        application_name: APP_CONFIG.appName,
        public_key: this.rsaKeys.public,
      };
    }

    return this.serializeParams(params);
  });
};
