import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';

import { PLAID_PUBLIC_KEY, USER_ID } from '../constants';
import Transaction from './Transaction';
import PlaidLink from './PlaidLink';


class BankTransactionList extends Component {

  render() {
    const userId = localStorage.getItem(USER_ID);

    if (!userId) {
      return (
        <div>Please sign in first :)</div>
      );
    }

    return (
      <Query query={CONNECTED_ITEM_QUERY} variables={{ "userId": userId }}>
        {({ loading, error, data }) => {
          if (loading) {
            return <div>Loading...</div>
          }
          if (error) {
            return <div>There's an error :(</div>
          }

          if (!data.connectedItem || !data.connectedItem.item_id) {
            return (
              <PlaidLink
                clientName="Splitsy"
                env="sandbox"
                product={["transactions"]}
                publicKey={PLAID_PUBLIC_KEY}
                onExit={() => console.log("Exited!")}
                onSuccess= {this._onPlaidLinkSuccess}>
                Open Link and connect your bank!
              </PlaidLink>
            );
          }

          return (
            <Query query={TRANSACTIONS_QUERY} variables={{ "userId": userId }}>
              {({ loading, error, data }) => {
                if (loading) {
                  return <div>Loading...</div>
                }
                if (error) {
                  return <div>There's an error :(</div>
                }

                const transactions = data.transactions;
                return (
                  <div className="mw7 center">
                    {transactions.map((t, index) => (
                      <Transaction transaction={t} key={t.transaction_id}/>
                    ))}
                  </div>
                );
              }}
            </Query>
          );
        }}
      </Query>
    );
  }

  // TODO: move this to be inside the PlaidLink component
  _onPlaidLinkSuccess = (public_token) => {
    const userId = localStorage.getItem(USER_ID);

    fetch('http://localhost:4000', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation ($publicToken: String!, $userId: String!) {
          storeAccessToken(publicToken: $publicToken, userId: $userId)
        }`,
        variables: { publicToken: public_token, userId: userId }
      })
    })
      .then(res => res.json())
      .then(res => console.log(res.data));
  }
}


export const TRANSACTIONS_QUERY = gql`
  query TransactionsQuery($userId: String!) {
    transactions(userId: $userId) {
      transaction_id
      date
      name
      category
      amount
      location {
        city
      }
    }
  }
`;

const CONNECTED_ITEM_QUERY = gql`
  query ConnectedItemQuery($userId: String!) {
    connectedItem(userId: $userId) {
      item_id
    }
  }
`;

export default BankTransactionList;
