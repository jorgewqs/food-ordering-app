import React from 'react';
import { View, StyleSheet, FlatList, TextInput, Text, Button } from 'react-native';
import gql from 'graphql-tag';
import short from 'short-uuid';
import {showMessage} from 'react-native-flash-message';
import { Modal, Portal } from 'react-native-paper';
import Card from '../../components/OrderItem';
import OrderButton from '../../components/Button';
import Message from '../../components/Error';
import RenderIf from '../../components/RenderIf';

import { colors, fonts } from '../../theme';
import { Mutation, Query } from 'react-apollo';
import { CREATE_ORDER } from '../../graphql/client';
import OrderForm from '../../components/OrderForm';


const createOrder = async (mutationFn,mutation, state, {additionalInfo, userPhoneNumber}) => {
  state.card.forEach(order => {
    const variables = {
      orderId:  short.uuid(),
      userId: state.user.id,
      restaurantId: order.restaurantId,
      ownerId: order.ownerId,
      itemPrice: order.itemPrice,
      itemName: order.itemName,
      userPhoneNumber,
      restaurantPhoneNumber: order.restaurantPhoneNumber,
      state: 'enviado',
      additionalInfo,
      quantity: order.quantity,
      userWillPay: order.quantity * order.itemPrice
    };

    mutationFn({
      mutation,
      variables,
      optimisticResponse: {
        createOrders: { ...variables, __typename: 'Order' },
        __typename: 'Mutation'
      }
    })
  })
}
class Order extends React.Component {
  state = {
    isOpen: false,
    value: {
      additionalInfo: '',
      userPhoneNumber: 0
    }
  }
  sendOrder = (fn, state, values) => {
    const {userPhoneNumber, additionalInfo} = values;
    createOrder(fn, CREATE_ORDER, state, {userPhoneNumber, additionalInfo})
      .then(success => {
        showMessage({type: 'success', message: 'A sua encomenda foi enviada ao restaurante!'});
        this.props.resetCard();
        this.setState({isOpen: false});
      })
      .catch(error => showMessage({
        type: 'danger',
        message: 'Ocorreu-se algum errro',
        description: 'Deve-se à um ou mais problemas com os dados do item',
        backgroundColor: "red"
      }))
  }

  openModal = () => {
    this.setState({isOpen: true});
  }

  closeModal = () => {
    this.setState({isOpen: false});
  }

  removeFromCard = async (card, cache, foodId) => {
    const newCard = card.filter(el => {
      console.log(card, el, foodId
        )
      if(el.foodId === foodId) return;
      return { ...el, __typename: 'CardItem'};
    });
    cache.writeData({
      data: {
        shopCard: {
          items: [ ...newCard],
          __typename: 'Card'
        }
      }
    });
  }
  render() {
    return (
      <Query query={gql`{
        user @client {
          image
          firstName
          lastName
          email
          id
        }
        shopCard @client {
          items {
            quantity
            foodId
            itemName
            itemPrice
            ownerId
            restaurantId
            restaurantPhoneNumber
            userId
          }
        }
      }`}>
        {({data: {shopCard, user}}) => (
          <Mutation mutation={CREATE_ORDER}>
            {(mutationFn, {data, client}) => {
              return (
                <View style={styles.container}>
                  <RenderIf
                    condition={shopCard.items.length !== 0}
                    children={() => (
                      <FlatList
                        style={styles.scroll}
                        data={shopCard.items}
                        keyExtractor={(item, index) => item.foodId}
                        renderItem={
                          ({item: {itemName, itemPrice, foodId, quantity}}) => (
                            <Card
                              index={foodId}
                              name={itemName}
                              quantity={quantity}
                              foodId={foodId}
                              onDelete={() => this.removeFromCard(shopCard.items, client, foodId)}
                            />
                          )}
                      />
                    )}
                    fallback={() => (
                      <Message text='O carrinho está vazio!' textStyle={{fontSize: 18}}/>
                    )}
                  />
                  <RenderIf
                    condition={shopCard.items.length !== 0}
                    children={() => (
                      <View style={styles.orderBtn}>
                        <OrderButton
                          onPress={this.openModal}
                          buttonStyle={{backgroundColor: colors.green}}
                          text=" Encomendar"
                        />
                      </View>
                    )}
                  />
                  <Portal>
                    <Modal visible={this.state.isOpen} onDismiss={this.closeModal}>
                      <OrderForm
                        value={this.state.value}
                        onOrder={values => this.sendOrder(mutationFn, {card: shopCard.items, user}, values)}
                        amount={getTotalAmount(shopCard.items)}
                      />
                    </Modal>
                  </Portal>
                </View>
              )
            }}
          </Mutation>
        )}
      </Query>
    )
  }
}


const getTotalAmount = (card) => {
  const prices = card.map(el => el.itemPrice * el.quantity);
  const total  = prices.reduce((a, b) => a + b, 0)
  return total;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    borderBottomWidth: 0.3,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderColor: '#cccccc'
  },
  orderBtn: {
    width: '100%',
    padding: 20
  },
  scroll: {
    width: '100%'
  }
})

export default Order;
