import firebase from '@react-native-firebase/app';
import '@react-native-firebase/messaging';
import APP_CONFIG from '../app_config';

const noopMessaging = {
  getToken: async () => null,
  onTokenRefresh: () => () => {},
  onMessage: () => () => {},
  onNotificationOpenedApp: () => () => {},
};

let messaging = noopMessaging;

if (APP_CONFIG.pushBaseUrl) {
  try {
    messaging = firebase.messaging();
  } catch (error) {
    console.warn('Senin.me Firebase Messaging is not configured', error);
  }
}

export default messaging;
