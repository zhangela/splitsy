import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import TripTransaction from './TripTransaction';
import { USER_ID } from '../constants';


class TripTransactionList extends Component {

  render() {
    const currentUserId = localStorage.getItem(USER_ID);

    return (
      <Query query={TRIP_TRANSACTIONS_QUERY} variables={{ "tripId": this.props.tripId }}>
        {({ loading, error, data }) => {
          if (loading) {
            return <div>Loading...</div>
          }
          if (error) {
            return <div>There's an error :(</div>
          }

          console.log("tripTransactionsList", data);
          const tripTransactions = data.trip.transactions;
          return (
            <div className="mw7 center">
              {tripTransactions.map((t, index) => (
                <TripTransaction tripTransaction={t} key={t.id}/>
              ))}
            </div>
          );
        }}
      </Query>
    );
  }
}


export const TRIP_TRANSACTIONS_QUERY = gql`
  query TripTransactionsQuery($tripId: String!) {
    trip(tripId: $tripId) {
      transactions {
        id
        user {
          id
          name
        }
        trip {
          id
        }
        plaidTransactionId
        date
        name
        category
        amount
      }
    }
  }
`;

export default TripTransactionList;
