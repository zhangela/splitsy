import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { USER_ID } from '../constants';


class BankTransactionList extends Component {

  render() {
    if (this.props.transactionsQuery && this.props.transactionsQuery.loading) {
      return <div>Loading</div>;
    }

    if (this.props.transactionsQuery && this.props.transactionsQuery.error) {
      return <div>Error</div>;
    }

    const transactions = this.props.transactionsQuery.transactions;

    return (
      <div>
        {transactions.map((t, index) => (
          <div>
            {t.name} - {t.amount}
          </div>
        ))}
      </div>
    )
  }
}


export const TRANSACTIONS_QUERY = gql`
  query TransactionsQuery($userId: String!) {
    transactions(userId: $userId) {
      transaction_id
      name
      amount
    }
  }
`;

// the data will be available through this.props.transactionsQuery instead of this.props.data
export default graphql(
  TRANSACTIONS_QUERY, {
    name: 'transactionsQuery',
    options: ownProps => {
      console.log("userId", localStorage.getItem(USER_ID));
      return {
        variables: {
          userId: localStorage.getItem(USER_ID)
        }
      }
    }
  }) (BankTransactionList);
