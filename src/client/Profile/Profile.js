/* eslint-disable no-use-before-define */
import React from 'react';
import { View, Text, StyleSheet, AsyncStorage } from 'react-native';
import { Query, withApollo } from 'react-apollo';
import gql from 'graphql-tag';

import { Avatar } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { colors, fonts } from '../../theme';
import LogoutButton from '../../components/Button';

export const GET_LOCAL_USER = gql`
  {
    user @client {
      id
      image
      firstName
      lastName
      email
    }
  }
`;

const signOut = async cache => {
  await cache.clearStore();
};

const Profile = ({ navigation, client }) => (
  <Query query={GET_LOCAL_USER}>
    {({ data: { user } }) => (
      <View style={styles.container}>
        <View style={styles.info}>
          <Avatar
            xlarge
            rounded
            source={{ uri: user && user ? user.image : '' }}
            activeOpacity={0.7}
          />
        </View>

        <View style={styles.wrapper}>
          <View style={styles.el}>
            <Icon name="account-box-outline" size={25} color="#FB28" />
            <Text style={styles.keys}>{user && user ? user.firstName : ''}</Text>
          </View>
          <View style={styles.el}>
            <Icon name="account-box-outline" size={25} color="#FB28" />
            <Text style={styles.keys}>{user && user ? user.lastName : ''}</Text>
          </View>
          <View style={styles.el}>
            <Icon name="email" size={25} color="#FB28" />
            <Text style={styles.keys}>{user && user ? user.email : ''}</Text>
          </View>
        </View>

        <LogoutButton
          onPress={async () => {
            await AsyncStorage.clear();
            await signOut(client);
            navigation.navigate('Auth');
          }}
          buttonStyle={{ backgroundColor: colors.red }}
          text="Terminar sessão"
        />
      </View>
    )}
  </Query>
);

Profile.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  info: {
    padding: 10,
    marginTop: 50,
    marginLeft: 10,
    flexDirection: 'column',
    alignItems: 'flex-start',
    alignItems: 'center',
  },
  wrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  text: {
    textAlign: 'left',
    fontWeight: '700',
  },
  keys: {
    textAlign: 'left',
    fontWeight: '500',
    // fontFamily: 'space-mono'
  },
  el: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    padding: 10,
    width: '80%',
    height: 60,
    borderRadius: 5,
    backgroundColor: '#fff',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    shadowColor: 'black',
    shadowOffset: { height: 0, width: 0 },
  },
});

export default withApollo(Profile);
