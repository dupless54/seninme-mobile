/* @flow */
'use strict';

import { PermissionsAndroid, Platform } from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import APP_CONFIG from './app_config';

let installed = false;

/**
 * Keep inherited DiscourseMobile notification code dormant until Senin.me has
 * its own push relay and platform credentials. This adapter intentionally
 * lives outside the upstream app class so future upstream syncs stay small.
 */
export const installPushPolicy = DiscourseClass => {
  if (installed || APP_CONFIG.pushBaseUrl) {
    return;
  }

  installed = true;

  if (Platform.OS === 'android') {
    const notificationPermission =
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
    const originalRequest = PermissionsAndroid.request.bind(PermissionsAndroid);
    const originalRequestMultiple =
      PermissionsAndroid.requestMultiple.bind(PermissionsAndroid);

    PermissionsAndroid.request = (permission, rationale) => {
      if (permission === notificationPermission) {
        return Promise.resolve(PermissionsAndroid.RESULTS.DENIED);
      }

      return originalRequest(permission, rationale);
    };

    PermissionsAndroid.requestMultiple = permissions => {
      if (!permissions.includes(notificationPermission)) {
        return originalRequestMultiple(permissions);
      }

      const allowedPermissions = permissions.filter(
        permission => permission !== notificationPermission,
      );

      if (allowedPermissions.length === 0) {
        return Promise.resolve({
          [notificationPermission]: PermissionsAndroid.RESULTS.DENIED,
        });
      }

      return originalRequestMultiple(allowedPermissions).then(results => ({
        ...results,
        [notificationPermission]: PermissionsAndroid.RESULTS.DENIED,
      }));
    };
  }

  if (Platform.OS === 'ios') {
    PushNotificationIOS.requestPermissions = () =>
      Promise.resolve({ alert: false, badge: false, sound: false });
  }

  // Disable the inherited background local-notification fallback and ignore
  // stale notification callbacks from previous installs while push is off.
  DiscourseClass.prototype._initBackgroundFetch = async function () {};
  DiscourseClass.prototype._handleNotification = function () {};
};
