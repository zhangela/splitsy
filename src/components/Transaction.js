import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { USER_ID } from '../constants';
import { CURRENT_TRIP_QUERY } from './Trip';

class Transaction extends Component {

  state = {
    imageUrl: "https://cdn.pixabay.com/photo/2017/11/10/04/47/image-2935360_1280.png",
  }

  componentDidMount() {
    this._getTransactionImage();
  }

  render() {

    const currentUserId = localStorage.getItem(USER_ID);
    const t = this.props.transaction;
    return (
      <article className="dt w-100 bb b--black-05 pb2 mt2">
        <div className="dtc w2 w3-ns v-mid">
          <img
            src={this.state.imageUrl}
            className="ba b--black-10 db br-100 w2 w3-ns h2 h3-ns"
            alt={t.category}
          />
        </div>


        <div className="cf">

          <div className="pa3 fl w-25 pv3">
            <h1 className="f6 f5-ns fw6 black mv0">
              {t.name}
            </h1>
            <h2 className="f6 fw4 mt0 mb0 black-60">
              {t.date}
            </h2>
          </div>

          <div className="pa3 fl w-25 pv3">
            <h2 className="f6 fw4 mt0 mb0 black-60">
              ${t.amount}
            </h2>
          </div>

          <div className="pa3 fl w-25 pv3">
            <h2 className="f6 fw4 mt0 mb0 black-60">
              {t.category && t.category[0]}
            </h2>
          </div>

          <Query query={CURRENT_TRIP_QUERY} variables={{ userId: currentUserId }}>
            {({ loading, error, data }) => {
              const currentTrip = data.currentTrip;

              if (currentTrip) {
                const plaidTransactionIds = currentTrip.transactions.map(
                  (tt) => {
                    return tt.plaidTransactionId;
                  });

                  if (plaidTransactionIds.includes(t.transaction_id)) {

                  // Transaction already in current trip
                  return (
                    <Mutation mutation={REMOVE_TRANSACTION_FROM_TRIP_MUTATION}>
                      {(removeTransactionFromTrip, { data }) => (
                        <div className="fl w-25 tc pv3">
                          <form className="w-100 tr">
                            <button
                              className="f6 button-reset bg-light-gray ba b--black-10 dim pointer pv1 black-60"
                              type="submit"
                              onClick={e => {
                                e.preventDefault();
                                removeTransactionFromTrip({
                                  variables: {
                                    tripId: currentTrip.id,
                                    plaidTransactionId: t.transaction_id,
                                  }
                                });
                              }}
                            >
                            - Remove
                            </button>
                          </form>
                        </div>
                      )}
                    </Mutation>
                  );

                } else {

                  // Transaction not in current trip
                  return (
                    <Mutation mutation={ADD_TRANSACTION_TO_TRIP_MUTATION}>
                      {(addTransactionToTrip, { data }) => (
                        <div className="fl w-25 tc pv3">
                          <form className="w-100 tr">
                            <button
                              className="f6 button-reset bg-white ba b--black-10 dim pointer pv1 black-60"
                              type="submit"
                              onClick={e => {
                                e.preventDefault();
                                addTransactionToTrip({
                                  variables: {
                                    tripId: currentTrip.id,
                                    plaidTransactionId: t.transaction_id,
                                    category: t.category,
                                    name: t.name,
                                    amount: t.amount,
                                    date: t.date
                                  }
                                });
                              }}
                            >
                            + Add to trip
                            </button>
                          </form>
                        </div>
                      )}
                    </Mutation>
                  );
                }
              } else {

                // There's no current trip.
                return <div></div>
              }
            }}
          </Query>
        </div>

      </article>
    )
  }

  async _getTransactionImage() {
    if (!this.props.transaction.category) {
      return;
    }

    const category = this.props.transaction.category[0];

    const response = await fetch(
      'https://pixabay.com/api/?' +

      // TODO: BAD!!! I really shouldn't be committing this key here
      'key=8632845-58f0d8df35bfbbf3444bc23da' +
      '&image_type=photo' +
      '&q=' + category.replace(new RegExp(' ', 'g'), '+')
    );

    const imageData = await response.json();

    if (imageData.hits && imageData.hits[0] && imageData.hits[0].previewURL) {
      this.setState({ imageUrl: imageData.hits[0].previewURL });
    }
  }
}

const ADD_TRANSACTION_TO_TRIP_MUTATION = gql`
  mutation AddTransactionToTripMutation(
    $tripId: String!
    $plaidTransactionId: String!
    $category: [String!]
    $name: String!
    $amount: Float!
    $date: String!
  ){
    addTransactionToTrip(
      tripId: $tripId,
      plaidTransactionId: $plaidTransactionId,
      category: $category,
      name: $name,
      amount: $amount,
      date: $date
    ) {
      id
    }
  }
`;

const REMOVE_TRANSACTION_FROM_TRIP_MUTATION = gql`
  mutation RemoveTransactionFromTripMutation(
    $tripId: String!
    $plaidTransactionId: String!
  ){
    removeTransactionFromTrip(
      tripId: $tripId,
      plaidTransactionId: $plaidTransactionId
    )
  }
`;

export default Transaction;
