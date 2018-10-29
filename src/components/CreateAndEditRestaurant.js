'use strict';

import React from 'react';
import _ from 'lodash';
import {StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {Mutation, graphql} from 'react-apollo';
import t from 'tcomb-form-native';
import gql from 'graphql-tag';
import Form from './Form';
import CardOverlay from './CardOverlay';
import {showMessage} from 'react-native-flash-message';
import {DELETE_RESTAURANTE} from '../graphql/owner/index'

const RestauranteType = t.struct({
  name: t.String,
  description: t.String,
  location: t.String,
  waitTime: t.Number,
  speciality: t.String,
  image: t.String
});

export default class _Form extends React.Component {
  state = {
    value: {
      name: '',
      description: '',
      location: '',
      waitTime: 0,
      speciality: '',
      image: ''
    }
  }

  onChange = (value) => {
    this.setState({value})
  }

  mutate  = (e, mutationFn, client) => {
    e.preventDefault();
    const {
      props: {
        restaurantId,
        ownerId,
        mutationName,
        edit
      },
      state:{ value }
    } = this;
    const variables = {
      ...value,
      restaurantId,
      ownerId
    };

    if(!this.props.edit) {
      if (
        value.name === '' ||
        value.description === '' ||
        value.location === '' ||
        value.waitTime === 0 ||
        value.speciality === '' ||
        value.image === ''
        ) {
          return showMessage({
            type: 'warning',
            message: 'Os campos não devem estar vazios'
          });
      }
    }
    mutationFn({
      variables,
      optimisticResponse: () => ({
        [mutationName]: { ...variables, __typename: 'Restaurant' },
        __typename: 'Mutation'
      }, {}),
    })
    .then(data => {
      if(edit && !_.isEmpty(data.data.updateRestaurant) || !_.isEmpty(data.data.createRestaurant)) {
        client.resetStore();
        showMessage({type: 'success', message: 'Item guardado com sucesso!'});
        return this.props.goBack()
      }
      return showMessage({
        type: 'danger',
        message: 'Ocorreu-se algum errro',
        description: 'Deve-se à um problema técnico com os nossos servidores',
        backgroundColor: "red"
      })
    })
    .catch(err => showMessage({
      type: 'danger',
      message: 'Ocorreu-se algum errro',
      description: 'Deve-se à um ou mais problemas com os dados do restaurante',
      backgroundColor: "red"
    }));
  }

  deleteRestaurant = (client, restaurantId) => {
    client.mutate({mutation: DELETE_RESTAURANTE, variables: {restaurantId}})
    .then(({data}) => {
      client.resetStore();
      showMessage({type: 'success', message: 'Apagado com sucesso'})
      return this.props.goBack()
    })
    .catch(err => showMessage({
      type: 'danger',
      message: 'Houve um erro ao tentar apagar este restaurante',
      backgroundColor: 'red'
    }))
  }
  render() {
    const {
      options,
      mutation,
      text,
      value = this.state.value,
      containerStyle,
      formStyle,
      children = () => null
    } = this.props;
    return (
      <Mutation mutation={mutation}>
        {(mutationFn, {client, data, error, loading}) => (
          <View style={[styles.container, containerStyle]}>
            <CardOverlay
              source={value.image !== '' ? {uri: value.image} : require('../assets/placeholder.png')}
              disabled={true}
              />
            {children(this.deleteRestaurant.bind(this, client, this.props.restaurantId))}
            <Form
              type={RestauranteType}
              options={options}
              onChange={this.onChange}
              formStyle={formStyle}
              value={value}
              text={text}
              onSave={async e => await this.mutate(e, mutationFn, client)}
            />
          </View>
        )}
      </Mutation>
    )
  }
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    padding: 20,
    backgroundColor: '#fff',
  }
});