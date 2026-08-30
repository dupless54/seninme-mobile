/* @flow */
'use strict';

import React, { useContext } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import i18n from 'i18n-js';
import { ThemeContext } from '../../ThemeContext';

export default function SingleSiteRecovery({ loading, onRetry }) {
  const theme = useContext(ThemeContext);

  return (
    <View
      testID="seninme-site-recovery"
      style={[styles.container, { backgroundColor: theme.grayBackground }]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.background,
            borderColor: theme.grayBorder,
          },
        ]}
      >
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>S</Text>
        </View>
        <Text style={[styles.title, { color: theme.grayTitle }]}>Senin.me</Text>
        <Text style={[styles.subtitle, { color: theme.graySubtitle }]}>
          {loading
            ? i18n.t('single_site_recovery_loading')
            : i18n.t('single_site_recovery_description')}
        </Text>

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#9D1B2C" />
            <Text style={[styles.loadingText, { color: theme.graySubtitle }]}>
              {i18n.t('single_site_recovery_connecting')}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            testID="seninme-site-retry"
            activeOpacity={0.75}
            onPress={onRetry}
            style={styles.retryButton}
          >
            <FontAwesome5
              name="redo-alt"
              size={14}
              color="#FFFFFF"
              iconStyle="solid"
            />
            <Text style={styles.retryText}>
              {i18n.t('single_site_recovery_retry')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: 480,
    paddingHorizontal: 28,
    paddingVertical: 32,
    width: '100%',
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: '#9D1B2C',
    borderRadius: 18,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 18,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  retryButton: {
    alignItems: 'center',
    backgroundColor: '#9D1B2C',
    borderRadius: 11,
    flexDirection: 'row',
    gap: 8,
    marginTop: 22,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
