/* @flow */
'use strict';

import React, { useContext, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import { ThemeContext } from '../../ThemeContext';
import fetch from './../../../lib/fetch';
import i18n from 'i18n-js';

const TopicList = props => {
  const theme = useContext(ThemeContext);
  const [loadCompleted, setLoadCompleted] = useState(false);
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);

  const numberOfTopics = 10;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    placeholder: {
      marginLeft: props.largeLayout ? 30 : 0,
      minHeight: 560,
      paddingVertical: 12,
      flex: 1,
    },
    placeholderHeading: {
      height: 40,
      opacity: 0.3,
      marginBottom: 20,
    },
    placeholderMetadata: {
      height: 16,
      opacity: 0.2,
      marginBottom: 20,
    },
    itemsContainer: {
      flex: 1,
    },
    topicTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    topicGist: {
      fontSize: 14,
      paddingTop: 6,
      paddingBottom: 6,
    },
    topicRow: {
      paddingTop: 0,
      marginBottom: 15,
      paddingRight: props.largeLayout ? 20 : 0,
      marginLeft: props.largeLayout ? 30 : 0,
    },
    emptyItemsText: {
      marginLeft: props.largeLayout ? 30 : 0,
    },
    metadataFirstRow: {
      flexDirection: 'row',
      paddingTop: 6,
    },
    topicCounts: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      paddingLeft: 10,
    },
    topicCountsNum: {
      fontSize: 14,
      paddingRight: 8,
      paddingLeft: 4,
    },
    categoryBadge: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      opacity: 0.8,
    },
    categoryPill: {
      height: 9,
      width: 9,
      marginRight: 4,
    },
  });

  useEffect(() => {
    let active = true;
    const siteUrl = props.site.url;

    setLoadCompleted(false);

    fetch(`${siteUrl}/site.json`)
      .then(res => res.json())
      .then(siteJson => {
        if (!active) {
          return null;
        }

        setCategories(siteJson.categories || []);
        return fetch(`${siteUrl}/hot.json`);
      })
      .then(res => (res ? res.json() : null))
      .then(json => {
        if (!active || !json) {
          return;
        }

        const jsonTopics = json.topic_list?.topics || [];
        setTopics(
          jsonTopics
            .filter(topic => topic.pinned === false)
            .slice(0, numberOfTopics),
        );
      })
      .catch(e => {
        if (active) {
          console.log('Error fetching hot topics:', e);
          setTopics([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoadCompleted(true);
        }
      });

    return () => {
      active = false;
    };
  }, [props.site.url, props.refreshKey]);

  function _renderItems() {
    if (topics.length === 0) {
      return (
        <View style={styles.itemsContainer}>
          <Text style={{ ...styles.emptyItemsText, color: theme.grayTitle }}>
            {i18n.t('no_hot_topics')}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.itemsContainer}>
        <FlatList
          data={topics}
          keyExtractor={item => `topic-${item.id}`}
          scrollEnabled={false}
          renderItem={({ item, index }) => _renderTopic(item, index)}
        />
      </View>
    );
  }

  function _renderPlaceholder() {
    return (
      <View style={styles.placeholder}>
        <View
          style={{
            ...styles.placeholderHeading,
            backgroundColor: theme.grayUILight,
          }}
        />
        <View
          style={{
            ...styles.placeholderMetadata,
            backgroundColor: theme.grayUILight,
          }}
        />
        <View
          style={{
            ...styles.placeholderHeading,
            backgroundColor: theme.grayUILight,
          }}
        />
        <View
          style={{
            ...styles.placeholderMetadata,
            backgroundColor: theme.grayUILight,
          }}
        />
        <View
          style={{
            ...styles.placeholderHeading,
            backgroundColor: theme.grayUILight,
          }}
        />
        <View
          style={{
            ...styles.placeholderMetadata,
            backgroundColor: theme.grayUILight,
          }}
        />
      </View>
    );
  }

  function _renderTopic(item, index) {
    return (
      <TouchableHighlight
        onPress={() => _openTopic(item)}
        underlayColor={theme.background}
        activeOpacity={0.6}
        style={{
          ...styles.topicRow,
          borderBottomWidth:
            index === topics.length - 1 ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: theme.grayBorder,
          paddingBottom: index === topics.length - 1 ? 0 : 15,
        }}
      >
        <View>
          <Text style={{ ...styles.topicTitle, color: theme.grayTitle }}>
            {item.unicode_title || item.title}
          </Text>
          {item.ai_topic_gist && (
            <Text style={{ ...styles.topicGist, color: theme.grayTitle }}>
              {item.ai_topic_gist}
            </Text>
          )}
          <View style={styles.metadataFirstRow}>
            {_renderCategory(item.category_id)}
            <View style={styles.topicCounts}>
              <FontAwesome5
                name="reply"
                size={13}
                color={theme.grayUI}
                style={{ opacity: 0.75 }}
                iconStyle="solid"
              />
              <Text style={{ ...styles.topicCountsNum, color: theme.grayUI }}>
                {Math.max(0, item.posts_count - 1)}
              </Text>
              <FontAwesome5
                name="heart"
                size={13}
                color={theme.grayUI}
                style={{ opacity: 0.75 }}
                iconStyle="solid"
              />
              <Text style={{ ...styles.topicCountsNum, color: theme.grayUI }}>
                {item.like_count || 0}
              </Text>
            </View>
          </View>
        </View>
      </TouchableHighlight>
    );
  }

  function _renderCategory(categoryId) {
    const category = categories.find(o => o.id === categoryId);
    if (!category) {
      return <Text />;
    }

    return (
      <View style={styles.categoryBadge}>
        <View
          style={{
            ...styles.categoryPill,
            backgroundColor: `#${category.color}`,
          }}
        />
        <Text style={{ color: theme.grayTitle }}>{category.name}</Text>
      </View>
    );
  }

  function _openTopic(item) {
    props.onClickTopic(`/t/${item.slug}/${item.id}`);
  }

  return (
    <View
      testID="topic-list"
      style={{ ...styles.container, borderBottomColor: theme.grayBorder }}
    >
      {loadCompleted ? _renderItems() : _renderPlaceholder()}
    </View>
  );
};

export default TopicList;
