/* @flow */
'use strict';

import React from 'react';
import Immutable from 'immutable';
import { InteractionManager, RefreshControl, View } from 'react-native';
import { ImmutableVirtualizedList } from 'react-native-immutable-list-view';
import Components from './NotificationsScreenComponents';
import Common from './CommonComponents';
import DiscourseUtils from '../DiscourseUtils';
import APP_CONFIG from '../app_config';
import { ThemeContext } from '../ThemeContext';
import i18n from 'i18n-js';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

class NotificationsScreen extends React.Component {
  static replyTypes = [1, 2, 3, 6, 9, 11, 15, 16, 17];

  constructor(props) {
    super(props);

    this._siteManager = this.props.screenProps.siteManager;

    this.state = {
      progress: 0,
      renderPlaceholderOnly: true,
      selectedIndex: 0,
      connectedSites: this._siteManager.connectedSitesCount(),
      dataSource: Immutable.List(),
      isRefreshing: false,
    };

    this._onSiteManagerChange = () => this.onSiteManagerChange();
    this._primeNotifications();
  }

  _primeNotifications() {
    if (this._siteManager.connectedSitesCount() === 0) {
      this._refreshed = true;
      return;
    }

    if (this.props.screenProps.seenNotificationMap) {
      this._seenNotificationMap = this.props.screenProps.seenNotificationMap;
      this.refresh();
      return;
    }

    this._siteManager.getSeenNotificationMap().then(map => {
      this._seenNotificationMap = map;
      this.props.screenProps.setSeenNotificationMap(map);
      this.refresh();
    });
  }

  componentDidMount() {
    this._mounted = true;
    this._siteManager.subscribe(this._onSiteManagerChange);

    const connectedSites = this._siteManager.connectedSitesCount();
    const nextState = {};

    if (connectedSites !== this.state.connectedSites) {
      nextState.connectedSites = connectedSites;
    }

    if (this._notification) {
      nextState.dataSource = Immutable.fromJS(this._notification);
    }

    if (Object.keys(nextState).length > 0) {
      this.setState(nextState);
    }

    if (this._refreshed) {
      this.removePlaceholder();
    }
  }

  onSiteManagerChange() {
    const connectedSites = this._siteManager.connectedSitesCount();
    const previouslyConnected = this.state.connectedSites;

    if (connectedSites === previouslyConnected) {
      return;
    }

    this.setState({ connectedSites }, () => {
      if (connectedSites === 0) {
        this._notification = null;
        this._seenNotificationMap = null;
        this._refreshed = true;
        this.setState(
          {
            dataSource: Immutable.List(),
            isRefreshing: false,
            progress: 0,
          },
          () => {
            this.removePlaceholder();
          },
        );
        return;
      }

      if (previouslyConnected === 0) {
        this._siteManager.getSeenNotificationMap().then(map => {
          this._seenNotificationMap = map;
          this.props.screenProps.setSeenNotificationMap(map);
          this.refresh();
        });
      }
    });
  }

  setTimeout(callback, timeout) {
    if (this._mounted) {
      setTimeout(() => {
        if (this._mounted) {
          callback();
        }
      }, timeout);
    }
  }

  removePlaceholder() {
    InteractionManager.runAfterInteractions(() => {
      this.setTimeout(() => {
        this.setState({ renderPlaceholderOnly: false });
      }, 0);
    });
  }

  componentWillUnmount() {
    this._mounted = false;
    this._siteManager.unsubscribe(this._onSiteManagerChange);
  }

  render() {
    const theme = this.context;
    const title = i18n.t('notifications');

    if (this.state.renderPlaceholderOnly) {
      return (
        <SafeAreaView
          testID="seninme-notifications-screen"
          style={{ flex: 1, backgroundColor: theme.background }}
        >
          <Components.NavigationBar title={title} />
          <View style={{ height: 50, marginTop: 0, paddingTop: 0 }}>
            {this._renderListHeader()}
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView
        testID="seninme-notifications-screen"
        style={{ flex: 1, backgroundColor: theme.background }}
      >
        <Components.NavigationBar
          title={title}
          progress={this.state.progress}
        />

        {this._renderListHeader()}

        {this.state.dataSource.size > 0
          ? this._renderList()
          : this._renderEmptyNotifications()}
      </SafeAreaView>
    );
  }

  _renderEmptyNotifications() {
    if (APP_CONFIG.singleSite && this.state.connectedSites === 0) {
      return (
        <Components.EmptyNotificationsView
          testID="seninme-notifications-connect"
          text={i18n.t('settings_connect_description')}
          actionLabel={i18n.t('settings_connect_action')}
          onAction={() => this.props.navigation.navigate('Home')}
        />
      );
    }

    let text;
    switch (this.state.selectedIndex) {
      case 0:
        text = i18n.t('no_new_notifications');
        break;
      case 1:
        text = i18n.t('no_replies');
        break;
      case 2:
        text = i18n.t('no_notifications');
        break;
      default:
        text = '';
    }

    if (this.state.connectedSites === 0) {
      text = i18n.t('no_connected_sites');
    }

    return <Components.EmptyNotificationsView text={text} />;
  }

  _renderList() {
    const theme = this.context;

    return (
      <BottomTabBarHeightContext.Consumer>
        {tabBarHeight => (
          <ImmutableVirtualizedList
            contentContainerStyle={{ paddingBottom: tabBarHeight }}
            enableEmptySections={true}
            immutableData={this.state.dataSource}
            renderItem={rowData => this._renderListRow(rowData)}
            keyExtractor={rowData => this._listIndex(rowData)}
            ListEmptyComponent={''}
            refreshControl={
              <RefreshControl
                refreshing={this.state.isRefreshing}
                onRefresh={() => this.pullDownToRefresh()}
                tintColor={theme.graySubtitle}
              />
            }
          />
        )}
      </BottomTabBarHeightContext.Consumer>
    );
  }

  _openNotificationForSite(notification, site) {
    site.readNotification(notification).catch(e => {
      console.log('failed to mark notification as read ' + e);
    });

    let url = DiscourseUtils.endpointForSiteNotification(site, notification);
    this._siteManager.setActiveSite(site);
    this.props.screenProps.openUrl(url);
  }

  _listIndex(row) {
    let rowData = row.toJS();
    return rowData.notification.id.toString();
  }

  _renderListRow(row) {
    let rowData = row.item.toJS();

    return (
      <Components.Row
        site={rowData.site}
        singleSite={APP_CONFIG.singleSite}
        onClick={() =>
          this._openNotificationForSite(rowData.notification, rowData.site)
        }
        notification={rowData.notification}
      />
    );
  }

  refresh() {
    if (this._siteManager.connectedSitesCount() === 0) {
      this._refreshed = true;
      if (this._mounted) {
        this.setState({ dataSource: Immutable.List() }, () => {
          this.removePlaceholder();
        });
      }
      return Promise.resolve();
    }

    let types =
      this.state.selectedIndex === 1
        ? NotificationsScreen.replyTypes
        : undefined;
    return this._fetchNotifications(types, {
      onlyNew: this.state.selectedIndex === 0,
      newMap: this._seenNotificationMap || {},
      silent: false,
    });
  }

  pullDownToRefresh() {
    if (this.state.connectedSites === 0) {
      return;
    }

    this.setState({ isRefreshing: true });
    Promise.resolve(this.refresh()).finally(() => {
      if (this._mounted) {
        this.setState({ isRefreshing: false });
      }
    });
  }

  _renderListHeader() {
    if (APP_CONFIG.singleSite && this.state.connectedSites === 0) {
      return null;
    }

    return (
      <Common.Filter
        selectedIndex={this.state.selectedIndex}
        tabs={[i18n.t('new'), i18n.t('replies'), i18n.t('all')]}
        onChange={index => {
          this.setState({ selectedIndex: index }, () => {
            this.refresh();
          });
        }}
      />
    );
  }

  _fetchNotifications(notificationTypes, options) {
    if (this._fetching) {
      return this._fetchPromise || Promise.resolve();
    }
    this._fetching = true;

    if (this._mounted) {
      setTimeout(() => {
        if (this._mounted && this._fetching) {
          this.setState({
            progress: Math.random() * 0.4,
          });
        }
      }, 100);
    }

    this._fetchPromise = this._siteManager
      .notifications(notificationTypes, options)
      .then(notifications => {
        this._refreshed = true;

        if (this._siteManager.connectedSitesCount() === 0) {
          this._notification = null;
          if (this._mounted) {
            this.setState({ dataSource: Immutable.List(), progress: 0 });
            this.removePlaceholder();
          }
          return;
        }

        this._notification = notifications;

        if (this._mounted) {
          if (this.state.progress !== 0) {
            this.setState({
              progress: 1,
            });

            this.removePlaceholder();

            setTimeout(() => {
              if (this._mounted) {
                this.setState({ progress: 0 });
              }
            }, 400);
          }

          this.setState({
            dataSource: Immutable.fromJS(notifications),
          });

          this.removePlaceholder();
        }
      })
      .catch(error => {
        this._refreshed = true;
        console.log('Failed to refresh notifications', error);
        if (this._mounted) {
          this.setState({ dataSource: Immutable.List() });
          this.removePlaceholder();
        }
      })
      .finally(() => {
        this._fetching = false;
        this._fetchPromise = null;
      });

    return this._fetchPromise;
  }
}

NotificationsScreen.contextType = ThemeContext;

export default NotificationsScreen;
