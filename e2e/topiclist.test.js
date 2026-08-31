import i18n from 'i18n-js';

import { by, device, element, expect } from 'detox';

describe('Topic list', () => {
  beforeAll(async () => {
    i18n.translations = {
      en: require('../js/locale/en.json'),
    };

    i18n.locale = 'en';

    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show the Senin.me hot topics list', async () => {
    await expect(element(by.id('seninme-home-brand'))).toBeVisible();
    await expect(element(by.text(i18n.t('home')))).toBeVisible();
    await expect(element(by.text(i18n.t('home_trending')))).toBeVisible();
    await expect(element(by.id('topic-list'))).toExist();
  });
});
