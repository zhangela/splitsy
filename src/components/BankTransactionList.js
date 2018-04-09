import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { USER_ID } from '../constants';
import Transaction from './Transaction';


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
      <div className="mw7 center">
        {transactions.map((t, index) => (
          <Transaction transaction={t} key={t.transaction_id}/>
        ))}
      </div>
    )
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

// the data will be available through this.props.transactionsQuery instead of this.props.data
export default graphql(
  TRANSACTIONS_QUERY, {
    name: 'transactionsQuery',
    options: ownProps => {
      return {
        variables: {
          userId: localStorage.getItem(USER_ID)
        }
      }
    }
  }) (BankTransactionList);
