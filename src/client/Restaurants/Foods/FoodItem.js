import React from 'react'
import { View, Text, StyleSheet, Button, Image, ScrollView } from 'react-native';
import { Header } from 'react-native-elements';

import { Query, graphql } from "react-apollo";
import gql from 'graphql-tag'


import { connect } from 'redux-zero/react';
import actions from '../../../store/actions';

import CircleButton from '../../../components/CircleButton';
import AddToCardButton from '../../../components/Button';
import BackButton from '../../../components/BackButton';
import FoodItemCard from '../../../components/FoodItem';

import { colors, fonts } from '../../../theme'
import { getFood } from '../../../graphql/foods'

class Foods extends React.Component {
  addToCart = (foodId, userId, itemName, itemPrice) => {
    this.props.addToCard({foodId, userId, itemName, itemPrice})
    this.props.navigation.goBack()
  }
  render() {
    const {user: {user:userId}, navigation} = this.props;
    const {goBack, state} = navigation;
    const {foodId, name: FoodName} = state.params;
    return (
      <Query query={getFood} variables={{foodId}}>
        {({loading, err, data}) => {
        return (
          <View style={styles.container}>
            <Header
              backgroundColor={colors.primary}
              leftComponent={
                <BackButton
                  imagePath={require('../../../assets/back.png')}
                  onPress={() => goBack()}
                />
              }
              centerComponent={{ text: FoodName, style: { color: '#fff' } }}
            />
              <ScrollView>
                {data.getFood ?
                  (
                    <FoodItemCard
                      description={data.getFood.description}
                      name={data.getFood.name}
                      price={data.getFood.price}
                      image={data.getFood.image}
                      imagePath={{
                        add: require('../../../assets/add.png'),
                        substract: require('../../../assets/substract.png')
                      }}
                      onPress={{
                        add: () => {},
                        substract: () => {}
                      }}
                    />
                    )
                  : <Text style={styles.price}>Hey</Text>
                }
              </ScrollView>
              <AddToCardButton
                onPress={
                  () => this.addToCart(
                      foodId,
                      userId,
                      data.getFood.name,
                      data.getFood.name
                    )
                }
                imagePath={require('../../../assets/shopping-cart.png')}
                text=" Adicionar ao carrinho"
              />
          </View>
        )}}
      </Query>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  }
})
const mapToProps = ({isAuthed, user, addToCard, card, currentUser}) => ({isAuthed, user, addToCard, card, currentUser})
export default connect(mapToProps, actions)(Foods)