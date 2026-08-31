import { by, device, element, expect, waitFor } from 'detox';
import i18n from 'i18n-js';

const HOME_TIMEOUT = 30000;
const WEBVIEW_TIMEOUT = 30000;

describe.each([['en'], ['fr']])(`Single-site shell (locale: %s)`, locale => {
  beforeAll(() => {
    i18n.translations = {
      en: require('../js/locale/en.json'),
      fr: require('../js/locale/fr.json'),
    };

    i18n.locale = locale;
    i18n.fallbacks = true;
  });

  beforeEach(async () => {
    // A React Native reload can preserve the current native navigation stack.
    // Launch a fresh process so every scenario deterministically starts on the
    // Senin.me native Home screen while keeping normal persisted app data.
    await device.launchApp({
      newInstance: true,
      languageAndLocale: {
        language: locale,
        locale,
      },
      permissions: { notifications: 'YES' },
    });

    await waitFor(element(by.id('seninme-home-brand')))
      .toBeVisible()
      .withTimeout(HOME_TIMEOUT);
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

    // The WebView screen root is intentionally a non-hittable wrapper around
    // the native WebView. Detox can report that wrapper as not visible even
    // while the child WebView fills the screen, so assert route mount plus the
    // disappearance of the foreground Home surface instead.
    await waitFor(element(by.id('seninme-webview')))
      .toExist()
      .withTimeout(WEBVIEW_TIMEOUT);
    await expect(element(by.id('seninme-webview'))).toExist();
    await expect(element(by.id('seninme-home-feed'))).not.toBeVisible();
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
