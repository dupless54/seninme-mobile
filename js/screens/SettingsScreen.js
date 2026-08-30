/* @flow */
'use strict';

import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import DeviceInfo from 'react-native-device-info';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../ThemeContext';
import i18n from 'i18n-js';

const SettingsScreen = props => {
  const theme = React.useContext(ThemeContext);
  const site = props.screenProps.siteManager.listSites()[0];
  const username = site?.username;
  const authenticated = Boolean(site?.authToken && username);
  const isDark = theme.background !== '#FFFFFF';

  const openPath = path => {
    if (site) {
      props.screenProps.openUrl(`${site.url}${path}`);
    }
  };

  const toggleDarkMode = () => {
    const newTheme = isDark ? 'light' : 'dark';

    AsyncStorage.setItem('@Discourse.androidLegacyTheme', newTheme).then(() => {
      props.screenProps.toggleTheme(newTheme);
    });
  };

  const renderRow = ({ testID, icon, title, description, onPress }) => (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.72}
      onPress={onPress}
      style={[
        styles.row,
        {
          backgroundColor: theme.background,
          borderColor: theme.grayBorder,
        },
      ]}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: theme.grayBackground }]}
      >
        <FontAwesome5
          name={icon}
          size={17}
          color={theme.blueCallToAction}
          iconStyle="solid"
        />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowTitle, { color: theme.grayTitle }]}>
          {title}
        </Text>
        {description && (
          <Text style={[styles.rowDescription, { color: theme.graySubtitle }]}>
            {description}
          </Text>
        )}
      </View>
      <FontAwesome5
        name="chevron-right"
        size={13}
        color={theme.grayUI}
        iconStyle="solid"
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.grayBackground }}>
      <ScrollView
        testID="seninme-settings-screen"
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.grayTitle }]}>
            {i18n.t('settings')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.graySubtitle }]}>
            {i18n.t('settings_description')}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.graySubtitle }]}>
          {i18n.t('settings_account_section')}
        </Text>

        {authenticated ? (
          <View style={styles.section}>
            {renderRow({
              testID: 'seninme-settings-profile',
              icon: 'user',
              title: i18n.t('settings_profile'),
              description: `@${username}`,
              onPress: () => openPath(`/u/${encodeURIComponent(username)}`),
            })}
            {renderRow({
              testID: 'seninme-settings-account',
              icon: 'user-cog',
              title: i18n.t('settings_account'),
              description: i18n.t('settings_account_description'),
              onPress: () =>
                openPath(
                  `/u/${encodeURIComponent(username)}/preferences/account`,
                ),
            })}
            {renderRow({
              testID: 'seninme-settings-notifications',
              icon: 'bell',
              title: i18n.t('settings_notification_preferences'),
              description: i18n.t('settings_notification_description'),
              onPress: () =>
                openPath(
                  `/u/${encodeURIComponent(username)}/preferences/notifications`,
                ),
            })}
          </View>
        ) : (
          <TouchableOpacity
            testID="seninme-settings-connect"
            activeOpacity={0.75}
            onPress={() => props.navigation.navigate('Home')}
            style={[
              styles.connectCard,
              {
                backgroundColor: theme.background,
                borderColor: theme.grayBorder,
              },
            ]}
          >
            <View style={styles.connectText}>
              <Text style={[styles.rowTitle, { color: theme.grayTitle }]}>
                {i18n.t('settings_connect_title')}
              </Text>
              <Text
                style={[styles.rowDescription, { color: theme.graySubtitle }]}
              >
                {i18n.t('settings_connect_description')}
              </Text>
            </View>
            <Text
              style={[styles.connectAction, { color: theme.blueCallToAction }]}
            >
              {i18n.t('settings_connect_action')}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.sectionTitle, { color: theme.graySubtitle }]}>
          {i18n.t('settings_community_section')}
        </Text>
        <View style={styles.section}>
          {renderRow({
            testID: 'seninme-settings-privacy',
            icon: 'shield-alt',
            title: i18n.t('settings_privacy'),
            onPress: () => openPath('/privacy'),
          })}
          {renderRow({
            testID: 'seninme-settings-terms',
            icon: 'file-contract',
            title: i18n.t('settings_terms'),
            onPress: () => openPath('/tos'),
          })}
          {renderRow({
            testID: 'seninme-settings-about',
            icon: 'info-circle',
            title: i18n.t('settings_about'),
            onPress: () => openPath('/about'),
          })}
        </View>

        {Platform.OS === 'android' && Platform.Version < 29 && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.graySubtitle }]}>
              {i18n.t('settings_appearance_section')}
            </Text>
            <View
              style={[
                styles.switchRow,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.grayBorder,
                },
              ]}
            >
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: theme.grayTitle }]}>
                  {i18n.t('switch_dark')}
                </Text>
              </View>
              <Switch onValueChange={toggleDarkMode} value={isDark} />
            </View>
          </>
        )}

        <View style={styles.versionContainer}>
          <Text style={[styles.version, { color: theme.graySubtitle }]}>
            {i18n.t('settings_version', {
              version: DeviceInfo.getVersion(),
              build: DeviceInfo.getBuildNumber(),
            })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    paddingBottom: 20,
    paddingTop: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.7,
    marginBottom: 8,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  section: {
    gap: 8,
  },
  row: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 70,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    marginRight: 12,
    width: 38,
  },
  rowText: {
    flex: 1,
    paddingRight: 12,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rowDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  connectCard: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    padding: 16,
  },
  connectText: {
    flex: 1,
    paddingRight: 12,
  },
  connectAction: {
    fontSize: 14,
    fontWeight: '700',
  },
  switchRow: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 64,
    paddingHorizontal: 16,
  },
  versionContainer: {
    alignItems: 'center',
    paddingTop: 28,
  },
  version: {
    fontSize: 12,
  },
});

export default SettingsScreen;
