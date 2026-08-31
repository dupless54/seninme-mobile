import { by, device, element, expect } from 'detox';
import i18n from 'i18n-js';

describe.each([['en'], ['fr']])(`Single-site shell (locale: %s)`, locale => {
  beforeAll(async () => {
    i18n.translations = {
      en: require('../js/locale/en.json'),
      fr: require('../js/locale/fr.json'),
    };

    i18n.locale = locale;
    i18n.fallbacks = true;

    await device.launchApp({
      newInstance: true,
      languageAndLocale: {
        language: locale,
        locale,
      },
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should boot as the Senin.me single-site app', async () => {
    await expect(element(by.id('seninme-home-brand'))).toBeVisible();
    await expect(element(by.id('nav-plus-icon'))).not.toExist();
    await expect(element(by.text(i18n.t('home')))).toBeVisible();
  });

  it('should render the Senin.me native home feed', async () => {
    await expect(element(by.id('seninme-home-feed'))).toBeVisible();
    await expect(element(by.id('seninme-home-latest'))).toBeVisible();
    await expect(element(by.id('seninme-home-categories'))).toBeVisible();
  });

  it('should keep Senin.me content inside the native WebView', async () => {
    await element(by.id('seninme-home-latest')).tap();
    await expect(element(by.id('seninme-webview'))).toBeVisible();
  });

  it('should show Senin.me-only discovery actions', async () => {
    await element(by.text(i18n.t('discover'))).tap();
    await expect(element(by.id('seninme-discover-popular'))).toBeVisible();
    await expect(element(by.id('seninme-discover-search'))).toBeVisible();
  });

  it('should show the signed-out Senin.me Notifications state', async () => {
    await element(by.text(i18n.t('notifications'))).tap();
    await expect(element(by.id('seninme-notifications-screen'))).toBeVisible();
    await expect(element(by.id('seninme-notifications-connect'))).toBeVisible();
    await expect(
      element(by.id('seninme-notifications-connect-action')),
    ).toBeVisible();
    await element(by.id('seninme-notifications-connect-action')).tap();
    await expect(element(by.id('seninme-home-feed'))).toBeVisible();
  });

  it('should expose Senin.me settings on both platforms', async () => {
    await element(by.id('nav-settings-icon')).tap();
    await expect(element(by.id('seninme-settings-screen'))).toBeVisible();
    await expect(element(by.id('seninme-settings-privacy'))).toBeVisible();
    await expect(element(by.id('seninme-settings-terms'))).toBeVisible();
    await expect(element(by.id('seninme-settings-about'))).toBeVisible();
    await expect(element(by.id('seninme-settings-connect'))).toBeVisible();
  });
});
