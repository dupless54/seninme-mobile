/* @flow */
'use strict';

import React, { useContext } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import i18n from 'i18n-js';
import { ThemeContext } from '../../ThemeContext';
import TopicList from './TopicList';

const QUICK_ACTIONS = [
  {
    key: 'latest',
    icon: 'clock',
    endpoint: '/latest',
    label: 'home_latest',
    requiresAuth: false,
  },
  {
    key: 'new',
    icon: 'sparkles',
    endpoint: '/new',
    label: 'home_new',
    requiresAuth: true,
  },
  {
    key: 'unread',
    icon: 'circle',
    endpoint: '/unread',
    label: 'home_unread',
    requiresAuth: true,
  },
  {
    key: 'categories',
    icon: 'layer-group',
    endpoint: '/categories',
    label: 'home_categories',
    requiresAuth: false,
  },
];

export default function SingleSiteHome({ site, onOpen, onConnect, refreshing }) {
  const theme = useContext(ThemeContext);
  const actions = QUICK_ACTIONS.filter(
    action => !action.requiresAuth || Boolean(site.authToken),
  );

  if (site.hasChatEnabled && site.authToken) {
    actions.push({
      key: 'chat',
      icon: 'comments',
      endpoint: '/chat',
      label: 'home_chat',
      requiresAuth: true,
    });
  }

  return (
    <ScrollView
      testID="seninme-home-feed"
      style={{ flex: 1, backgroundColor: theme.grayBackground }}
      contentContainerStyle={styles.content}
      refreshControl={refreshing}
    >
      <View style={[styles.hero, { backgroundColor: theme.background }]}> 
        <Text style={[styles.eyebrow, { color: theme.blueCallToAction }]}> 
          {i18n.t('home_community_label')}
        </Text>
        <Text style={[styles.title, { color: theme.grayTitle }]}>Senin.me</Text>
        <Text style={[styles.subtitle, { color: theme.graySubtitle }]}> 
          {i18n.t('home_feed_description')}
        </Text>

        {!site.authToken && (
          <TouchableOpacity
            testID="seninme-home-connect"
            activeOpacity={0.75}
            onPress={onConnect}
            style={[
              styles.connectButton,
              { backgroundColor: theme.blueCallToAction },
            ]}
          >
            <FontAwesome5
              name="user"
              size={15}
              color={theme.buttonTextColor}
              iconStyle="solid"
            />
            <Text
              style={[styles.connectText, { color: theme.buttonTextColor }]}
            >
              {i18n.t('home_connect')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.actionsSection}>
        <Text style={[styles.sectionTitle, { color: theme.grayTitle }]}> 
          {i18n.t('home_quick_access')}
        </Text>
        <View style={styles.actionsGrid}>
          {actions.map(action => (
            <TouchableOpacity
              key={action.key}
              testID={`seninme-home-${action.key}`}
              activeOpacity={0.72}
              onPress={() => onOpen(action.endpoint)}
              style={[
                styles.actionCard,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.grayBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: theme.grayBackground },
                ]}
              >
                <FontAwesome5
                  name={action.icon}
                  size={16}
                  color={theme.blueCallToAction}
                  iconStyle="solid"
                />
              </View>
              <Text style={[styles.actionLabel, { color: theme.grayTitle }]}> 
                {i18n.t(action.label)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View
        style={[
          styles.feedSection,
          {
            backgroundColor: theme.background,
            borderColor: theme.grayBorder,
          },
        ]}
      >
        <View style={styles.feedHeader}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.grayTitle }]}> 
              {i18n.t('home_trending')}
            </Text>
            <Text style={[styles.sectionSubtitle, { color: theme.graySubtitle }]}> 
              {i18n.t('home_trending_description')}
            </Text>
          </View>
          <TouchableOpacity
            testID="seninme-home-see-all"
            activeOpacity={0.7}
            onPress={() => onOpen('/hot')}
          >
            <Text style={[styles.seeAll, { color: theme.blueCallToAction }]}> 
              {i18n.t('home_see_all')}
            </Text>
          </TouchableOpacity>
        </View>

        <TopicList
          site={site}
          onClickTopic={endpoint => onOpen(endpoint, { hotTopic: true })}
          largeLayout={false}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  hero: {
    borderRadius: 18,
    marginTop: 14,
    padding: 20,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    marginTop: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 520,
  },
  connectButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  connectText: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionsSection: {
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  actionCard: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    minWidth: '47%',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  actionIcon: {
    alignItems: 'center',
    borderRadius: 10,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  actionLabel: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  feedSection: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 24,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  feedHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    paddingLeft: 12,
    paddingTop: 3,
  },
});
