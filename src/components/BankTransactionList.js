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
      <div className="mw7 center">
        {transactions.map((t, index) => (
          <article className="dt w-100 bb b--black-05 pb2 mt2">
            <div className="dtc w2 w3-ns v-mid">
              <img
                src="http://mrmrs.github.io/photos/p/2.jpg"
                className="ba b--black-10 db br-100 w2 w3-ns h2 h3-ns" />
            </div>

            <div className="dtc v-mid pl3">
              <h1 className="f6 f5-ns fw6 lh-title black mv0">
                {t.name}
              </h1>
              <h2 className="f6 fw4 mt0 mb0 black-60">
                ${t.amount}
              </h2>
            </div>

            <div className="dtc v-mid">
              <form className="w-100 tr">
                <button
                  className="f6 button-reset bg-white ba b--black-10 dim pointer pv1 black-60"
                  type="submit"
                >
                + Add to trip
                </button>

              </form>
            </div>
          </article>
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
