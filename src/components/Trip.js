import React, { Component } from 'react';
import { Query, withApollo } from 'react-apollo';
import gql from 'graphql-tag';

import { USER_ID } from '../constants';
import CreateTrip from './CreateTrip';
import TripTransactionList from './TripTransactionList';

class Trip extends Component {
  render() {

    const userId = localStorage.getItem(USER_ID);

    return (
      <Query query={CURRENT_TRIP_QUERY} variables={{ userId }}>
        {({ loading, error, data }) => {
          if (loading) {
            return <div>Loading...</div>
          }
          if (error) {
            return <div>There's an error :(</div>
          }

          if (!data.currentTrip) {
            return <CreateTrip />
          }
          return (
            <div>
              <h2 className="lh-solid">Current Trip</h2>
              <div className="fl w-100 bg-near-white">
                <div className="mt1">
                  <div className="db fw4 lh-copy f6 pa3">
                    <span className="b">Trip Name:</span>
                    <div className="mt2 pa2 input-reset ba bg-transparent w-100 measure">
                      {data.currentTrip.name}
                    </div>
                  </div>
                </div>

                <div className="mt2">
                  <div className="db fw4 lh-copy f6 pa3">
                    <span className="b">Participants:</span>
                    <div className="mt2 pa2 input-reset ba bg-transparent w-100 measure">
                      {data.currentTrip.users.map((user) => {
                        return <div key={user.id}>{user.name}</div>
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt2">
                  <div className="db fw4 lh-copy f6 pa3">
                    <span className="b">Settled:</span>
                    <div className="mt2 pa2 input-reset ba bg-transparent w-100 measure">
                      {data.currentTrip.settled ? "Yes" : "No"}
                    </div>
                  </div>
                </div>

              </div>
              <div className="fl w-100">
                <div className="db fw4 lh-copy f6 pa3 mt3">
                  <span className="b">Transactions:</span>
                  <div className="mt2 pa2 input-reset ba bg-transparent w-100">
                    <TripTransactionList tripId={data.currentTrip.id} />
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

export default withApollo(Trip);
