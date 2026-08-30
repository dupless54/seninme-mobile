/* @flow */
'use strict';

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import { ThemeContext } from '../../ThemeContext';

class EmptyNotificationsView extends React.Component {
  render() {
    const theme = this.context;
    return (
      <View testID={this.props.testID} style={styles.container}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.grayBackground },
          ]}
        >
          <FontAwesome5
            name={'bell'}
            size={30}
            color={theme.blueCallToAction}
            iconStyle="solid"
          />
        </View>
        <Text style={{ ...styles.text, color: theme.grayTitle }}>
          {this.props.text}
        </Text>
        {this.props.onAction && this.props.actionLabel ? (
          <TouchableOpacity
            testID={this.props.testID ? `${this.props.testID}-action` : undefined}
            activeOpacity={0.75}
            onPress={this.props.onAction}
            style={[
              styles.actionButton,
              { backgroundColor: theme.blueCallToAction },
            ]}
          >
            <Text style={[styles.actionText, { color: theme.buttonTextColor }]}> 
              {this.props.actionLabel}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }
}

EmptyNotificationsView.contextType = ThemeContext;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    flex: 5,
    paddingHorizontal: 28,
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 24,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  text: {
    fontSize: 16,
    lineHeight: 23,
    marginTop: 18,
    maxWidth: 460,
    textAlign: 'center',
  },
  actionButton: {
    borderRadius: 10,
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default EmptyNotificationsView;
