import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { USER_ID } from '../constants';
import CreateTrip from './CreateTrip';
import TripTransactionList from './TripTransactionList';

class Trip extends Component {
  _readyToSettleUsers(usersReadyToSettle, users) {
    return usersReadyToSettle
      .map(user => user.name)
      .join(", ");
  }

  render() {

    const currentUserId = localStorage.getItem(USER_ID);
    if (!currentUserId) {
      return <div>Please sign in first :)</div>;
    }

    return (
      <Query query={CURRENT_TRIP_QUERY} variables={{ userId: currentUserId }}>
        {({ loading, error, data }) => {
          if (loading) {
            return <div>Loading...</div>
          }
          if (error) {
            return <div>There's an error :(</div>
          }

          const currentTrip = data.currentTrip;
          if (!currentTrip) {
            return <CreateTrip />
          }
          return (
            <div>
              <h2 className="lh-solid">Current Trip</h2>
              <div className="fl w-100 bg-near-white">
                <div className="mt1">
                  <div className="db fw4 lh-copy f6 pa3">
                    <span className="b">Trip Name:</span>
                    <div className="mt1 pa2 input-reset ba bg-transparent w-100 measure">
                      {currentTrip.name}
                    </div>
                  </div>
                </div>

                <div className="mt1">
                  <div className="db fw4 lh-copy f6 pa3">
                    <span className="b">Participants:</span>
                    <div className="mt1 pa2 input-reset ba bg-transparent w-100 measure">
                      {currentTrip.users.map((user) => {
                        return <div key={user.id}>{user.name}</div>
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt1">
                  <div className="db fw4 lh-copy f6 pa3">
                    <span className="b">Participants ready to settle:</span>
                    <div className="mt1 pa2 input-reset ba bg-transparent w-100 measure">
                      {currentTrip.readyToSettleUsers.length === 0 ?
                        "No one" : this._readyToSettleUsers(
                          currentTrip.readyToSettleUsers, currentTrip.users)}
                    </div>
                  </div>
                </div>

                <Mutation mutation={ADD_READY_TO_SETTLE_MUTATION}>
                  {(addReadyToSettle, { data }) => (
                    <div className="mt1">
                      <div className="db fw4 lh-copy f6 pa3 ">
                        <button
                          className="b bw2 b--gray bg-lightest-blue ba br3 black-70 no-underline grow inline-flex items-center mb3 pv2 ph3"
                          onClick={e => {
                            e.preventDefault();
                            addReadyToSettle({
                              variables: {
                                tripId: currentTrip.id,
                                userId: currentUserId,
                              }
                            });
                          }}>
                          <div className="w2 pv1 pr2">
                            <img
                              src="https://cdn1.iconfinder.com/data/icons/unigrid-finance-vol-3/57/014_money_cash_flow_cycle_consumption_transfer_finance_business-32.png"
                              style={{paddingTop: "4px", marginRight: "4px"}}
                              alt="transfer"
                            />
                          </div>
                          <span>I'm ready to settle</span>
                        </button>
                      </div>
                    </div>
                  )}
                </Mutation>

              </div>
              <div className="fl w-100">
                <div className="db fw4 lh-copy f6 pa3 mt3">
                  <span className="b">Transactions:</span>
                  <div className="mt2 pa2 input-reset ba bg-transparent w-100">
                    <TripTransactionList tripId={currentTrip.id} />
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </Query>
    );
  }
}

export const CURRENT_TRIP_QUERY = gql`
  query CurrentTripQuery($userId: String!) {
    currentTrip(userId: $userId) {
      id
      name
      settled
      readyToSettleUsers {
        id
        name
      }
      users {
        id
        name
      }
      transactions {
        id
        plaidTransactionId
      }
    }
  }
`;


const ADD_READY_TO_SETTLE_MUTATION = gql`
  mutation ReadyToSettleMutation(
    $tripId: String!
    $userId: String!
  ){
    addReadyToSettleUser(
      tripId: $tripId,
      userId: $userId
    )
  }
`;

export default Trip;
