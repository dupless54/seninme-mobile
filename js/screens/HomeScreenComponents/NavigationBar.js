/* @flow */
'use strict';

import React, { useContext } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from 'react-native';
import FontAwesome5 from '@react-native-vector-icons/fontawesome5';
import { ThemeContext } from '../../ThemeContext';
import APP_CONFIG from '../../app_config';

const NavigationBar = props => {
  const theme = useContext(ThemeContext);

  const renderSettingsButton = () => (
    <TouchableHighlight
      testID="nav-settings-icon"
      style={styles.settingsButton}
      underlayColor={'transparent'}
      onPress={props.onDidPressAndroidSettingsIcon}
    >
      <FontAwesome5
        name={'cog'}
        size={20}
        style={{ color: theme.grayUI }}
        iconStyle="solid"
      />
    </TouchableHighlight>
  );

  const renderPlusButton = () => {
    if (APP_CONFIG.singleSite) {
      return;
    }

    return (
      <TouchableHighlight
        style={styles.plusButton}
        underlayColor={'transparent'}
        testID="nav-plus-icon"
        onPress={props.onDidPressPlusIcon}
      >
        <FontAwesome5
          name={'plus'}
          size={20}
          style={{ color: theme.grayUI }}
          iconStyle="solid"
        />
      </TouchableHighlight>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.titleContainer}>
        <TouchableHighlight
          underlayColor={'transparent'}
          testID="seninme-home-brand"
          onPress={props.onDidPressBrand}
        >
          <Text style={[styles.title, { color: theme.grayTitle }]}>
            {APP_CONFIG.appName}
          </Text>
        </TouchableHighlight>
      </View>
      {renderSettingsButton()}
      {renderPlusButton()}
      <View
        style={[styles.separator, { backgroundColor: theme.grayBackground }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 50 : 60,
  },
  titleContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  separator: {
    bottom: 0,
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  settingsButton: {
    position: 'absolute',
    right: 6,
    top: 6,
    backgroundColor: 'transparent',
    padding: 12,
  },
  plusButton: {
    position: 'absolute',
    left: 6,
    top: 6,
    backgroundColor: 'transparent',
    padding: 12,
  },
});

export default NavigationBar;
