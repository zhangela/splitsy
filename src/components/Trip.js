import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { USER_ID } from '../constants';
import CreateTrip from './CreateTrip';
import TripTransactionList from './TripTransactionList';

class Trip extends Component {

  _everyoneIsReadyToSettle(tripUsers, readyToSettleUsers) {
    return tripUsers.length === readyToSettleUsers.length;
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

              <div className="cf pa3">
                <div className="fl w-50 bg-near-white">

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
                          "No one" : currentTrip.readyToSettleUsers.map((user) => {
                            return <div key={user.id}>{user.name}</div>
                          })
                        }
                      </div>
                    </div>
                  </div>

                  {
                    this._everyoneIsReadyToSettle(
                      currentTrip.users, currentTrip.readyToSettleUsers) ?

                    // Everyone is ready to settle!
                    <Mutation mutation={SETTLE_TRIP_MUTATION}>
                      {(settleTrip, { data }) => (
                        <div className="mt1">
                          <div className="db fw4 lh-copy f6 pa3 ">
                            <div
                              className="b bw2 b--black-70 bg-light-blue ba br3 black-70 no-underline grow inline-flex items-center mb3 pv2 ph3 pointer"
                              onClick={e => {
                                e.preventDefault();
                                settleTrip({
                                  variables: {
                                    tripId: currentTrip.id,
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
                              <span>Settle the whole trip for everyone!</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </Mutation>

                    :

                    // Still waiting for people to be ready
                    <Mutation mutation={ADD_READY_TO_SETTLE_MUTATION}>
                      {(addReadyToSettle, { data }) => (
                        <div className="mt1">
                          <div className="db fw4 lh-copy f6 pa3 ">
                            <div
                              className="b bw2 b--gray bg-lightest-blue ba br3 black-70 no-underline grow inline-flex items-center mb3 pv2 ph3 pointer"
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
                            </div>
                          </div>
                        </div>
                      )}
                    </Mutation>
                  }
                </div>


              <div className="fl w-50 ">
                <div className="mt1">
                  <div className="db fw4 lh-copy f6 pa3">
                    <span className="b">Balance:</span>
                      <ul className="list pl0 mt0">
                        {currentTrip.tripBalance.map(balanceItem => {
                          const userName = balanceItem.user.name;
                          const userId = balanceItem.user.id;
                          const userBalance = balanceItem.balance;
                          return (
                            <li
                              key={balanceItem.user.id}
                              className="flex items-center lh-copy pa3 ph0-l bb b--black-10">
                                <img
                                  className="w2 h2 w3-ns h3-ns br-100"
                                  src="https://cdn0.iconfinder.com/data/icons/elasto-online-store/26/00-ELASTOFONT-STORE-READY_user-circle-128.png"
                                  alt="user profile"
                                />
                                <div className="pl3 flex-auto f6 db black-70">
                                  {userName} {userId === currentUserId && " (you)"}
                                </div>
                                <div>
                                  { userBalance > 0 ?
                                    <span className="f6 green">gets back ${Math.round(userBalance * 100) / 100}</span> :
                                    <span className="f6 red">owes ${Math.round(Math.abs(userBalance) * 100) / 100}</span>
                                  }
                                </div>
                            </li>
                          );
                        })}
                      </ul>
                  </div>
                </div>

                { this._everyoneIsReadyToSettle(
                  currentTrip.users, currentTrip.readyToSettleUsers) &&
                  (
                    <div className="mt1">
                      <div className="db fw4 lh-copy f6 pa3">
                        <span className="b">Proposed Payments:</span>
                          <ul className="list pl0 mt0">
                            {currentTrip.plannedPayments.map(payment => {
                              const fromUserName = payment.from.name;
                              const toUserName = payment.to.name;
                              const amount = payment.amount;
                              return (
                                <li
                                  key={payment.from.id + "-" + payment.to.id}
                                  className="flex items-center lh-copy pa3 ph0-l bb b--black-10">
                                    <div className="pl3 flex-auto f6 db black-70">
                                      {fromUserName} -> {toUserName}
                                    </div>
                                    <span className="f6">${Math.round(amount * 100) / 100}</span>
                                </li>
                              );
                            })}
                          </ul>
                      </div>
                    </div>
                  )
                }


              </div>
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
        user {
          id
          name
        }
        name
        amount
      }
      tripBalance {
        user {
          id
          name
        }
        balance
      }
      plannedPayments {
        from {
          id
          name
        }
        to {
          id
          name
        }
        amount
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

const SETTLE_TRIP_MUTATION = gql`
mutation SettleTripMutation(
  $tripId: String!
){
  settleTrip(
    tripId: $tripId,
  )
}
`;

export default Trip;
