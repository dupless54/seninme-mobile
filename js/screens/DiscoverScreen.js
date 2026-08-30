/* @flow */
'use strict';

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import { SafeAreaView } from 'react-native-safe-area-context';
import i18n from 'i18n-js';
import { ThemeContext } from '../ThemeContext';
import APP_CONFIG from '../app_config';

const DISCOVERY_ITEMS = [
  {
    key: 'popular',
    icon: 'fire',
    route: '/top',
    title: 'seninme_discover_popular',
    description: 'seninme_discover_popular_description',
  },
  {
    key: 'latest',
    icon: 'clock',
    route: '/latest',
    title: 'seninme_discover_latest',
    description: 'seninme_discover_latest_description',
  },
  {
    key: 'categories',
    icon: 'layer-group',
    route: '/categories',
    title: 'seninme_discover_categories',
    description: 'seninme_discover_categories_description',
  },
  {
    key: 'tags',
    icon: 'tags',
    route: '/tags',
    title: 'seninme_discover_tags',
    description: 'seninme_discover_tags_description',
  },
  {
    key: 'search',
    icon: 'search',
    route: '/search',
    title: 'seninme_discover_search',
    description: 'seninme_discover_search_description',
  },
];

class DiscoverScreen extends React.Component {
  openRoute(route) {
    this.props.screenProps.openUrl(`${APP_CONFIG.defaultSiteUrl}${route}`);
  }

  renderItem(item) {
    const theme = this.context;

    return (
      <TouchableOpacity
        key={item.key}
        accessibilityRole="button"
        testID={`seninme-discover-${item.key}`}
        activeOpacity={0.75}
        onPress={() => this.openRoute(item.route)}
        style={[
          styles.card,
          {
            backgroundColor: theme.background,
            borderColor: theme.grayBorder,
          },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.grayBackground },
          ]}
        >
          <FontAwesome5
            name={item.icon}
            size={20}
            color={theme.blueCallToAction}
            iconStyle="solid"
          />
        </View>
        <View style={styles.cardText}>
          <Text style={[styles.cardTitle, { color: theme.grayTitle }]}>
            {i18n.t(item.title)}
          </Text>
          <Text style={[styles.cardDescription, { color: theme.graySubtitle }]}>
            {i18n.t(item.description)}
          </Text>
        </View>
        <FontAwesome5
          name="chevron-right"
          size={14}
          color={theme.grayUI}
          iconStyle="solid"
        />
      </TouchableOpacity>
    );
  }

  render() {
    const theme = this.context;

    return (
      <SafeAreaView
        edges={['top', 'left', 'right']}
        style={[styles.container, { backgroundColor: theme.grayBackground }]}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.heading}>
            <Text style={[styles.title, { color: theme.grayTitle }]}>
              {i18n.t('seninme_discover_title')}
            </Text>
            <Text style={[styles.subtitle, { color: theme.graySubtitle }]}>
              {i18n.t('seninme_discover_description')}
            </Text>
          </View>

          <View style={styles.grid}>
            {DISCOVERY_ITEMS.map(item => this.renderItem(item))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

DiscoverScreen.contextType = ThemeContext;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 110,
  },
  heading: {
    paddingHorizontal: 4,
    paddingBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.7,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
    marginTop: 6,
  },
  grid: {
    gap: 10,
  },
  card: {
    minHeight: 82,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    paddingHorizontal: 13,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
});

export default DiscoverScreen;
