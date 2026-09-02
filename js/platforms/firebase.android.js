/* @flow */
'use strict';

// Senin.me remote push is intentionally fail-closed until the app owns and
// configures its Firebase project and push relay. Keep this adapter free of
// static @react-native-firebase imports so Metro cannot initialize an
// unconfigured native Firebase module.
const messaging = {
  getToken: async () => null,
  onTokenRefresh: () => () => {},
  onMessage: () => () => {},
  onNotificationOpenedApp: () => () => {},
};

export default messaging;
