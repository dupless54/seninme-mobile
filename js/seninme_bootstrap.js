/* @flow */
'use strict';

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Site from './site';
import SiteManager from './site_manager';
import APP_CONFIG from './app_config';

const normalizeUrl = url => (url || '').replace(/\/+$/, '');

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

      const configuredUrl = normalizeUrl(APP_CONFIG.defaultSiteUrl);
      let configuredSite = storedSites.find(
        site => normalizeUrl(site.url) === configuredUrl,
      );

      if (!configuredSite) {
        configuredSite = await Site.fromTerm(APP_CONFIG.defaultSiteUrl);
      }

      if (!configuredSite) {
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

SiteManager.prototype.add = function (site) {
  if (!APP_CONFIG.singleSite) {
    return;
  }

  if (normalizeUrl(site.url) !== normalizeUrl(APP_CONFIG.defaultSiteUrl)) {
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
