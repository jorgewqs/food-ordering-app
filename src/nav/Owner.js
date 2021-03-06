/* eslint-disable react/prop-types */
/* eslint-disable global-require */
import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from 'react-navigation';

import { colors, fonts } from '../theme';
import MyRestaurants from '../owner/Restaurants';
import Search from '../client/Search/Search';
import Profile from '../client/Profile/Profile';
import Orders from '../owner/Orders';

const styles = StyleSheet.create({
  icon: {
    width: 26,
    height: 26,
  },
});

const routes = {
  MyRestaurants: {
    screen: MyRestaurants,
    navigationOptions: {
      title: 'Meus Restaurants',
      tabBarIcon: ({ tintColor }) => (
        <Image source={require('../assets/home.png')} style={[styles.icon, { tintColor }]} />
      ),
    },
  },
  Orders: {
    screen: Orders,
    navigationOptions: {
      title: 'Encomendas',
      tabBarIcon: ({ tintColor }) => (
        <Image source={require('../assets/invoice.png')} style={[styles.icon, { tintColor }]} />
      ),
    },
  },
  Profile: {
    screen: Profile,
    navigationOptions: {
      header: null,
      title: 'Perfil',
      tabBarIcon: ({ tintColor }) => (
        <Image source={require('../assets/boy.png')} style={[styles.icon, { tintColor }]} />
      ),
    },
  },
};

const routeConfig = {
  tabBarPosition: 'bottom',
  tabBarOptions: {
    showLabel: true,
    activeTintColor: '#191919',
    inactiveTintColor: 'white',
    indicatorStyle: { backgroundColor: 'white' },
    labelStyle: {
      fontSize: 12,
    },
    style: {
      backgroundColor: colors.primary,
      borderTopWidth: 0,
      paddingBottom: 3,
      zIndex: 9999,
    },
  },
};

export default { routes, routeConfig };
