import React, { Component } from 'react';
import { Query, withApollo } from 'react-apollo';
import gql from 'graphql-tag';

import { USER_ID } from '../constants';
import CreateTrip from './CreateTrip';
import TripTransactionList from './TripTransactionList';

class Trip extends Component {
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

                <div className="mt2">
                  <div className="db fw4 lh-copy f6 pa3 ">
                    <a className=" bg-lightest-blue ba br2 black-70 no-underline grow b inline-flex items-center mb3 pv2 ph3" href="https://github.com/tachyons-css/tachyons/issues" title="File a bug, request a feature, ask a question!">
                      <div className="w2 pv1 pr2">
                      < svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit="1.414"><path d="M8 0C3.58 0 0 3.582 0 8c0 3.535 2.292 6.533 5.47 7.59.4.075.547-.172.547-.385 0-.19-.007-.693-.01-1.36-2.226.483-2.695-1.073-2.695-1.073-.364-.924-.89-1.17-.89-1.17-.725-.496.056-.486.056-.486.803.056 1.225.824 1.225.824.714 1.223 1.873.87 2.33.665.072-.517.278-.87.507-1.07-1.777-.2-3.644-.888-3.644-3.953 0-.873.31-1.587.823-2.147-.083-.202-.358-1.015.077-2.117 0 0 .672-.215 2.2.82.638-.178 1.323-.266 2.003-.27.68.004 1.364.092 2.003.27 1.527-1.035 2.198-.82 2.198-.82.437 1.102.163 1.915.08 2.117.513.56.823 1.274.823 2.147 0 3.073-1.87 3.75-3.653 3.947.287.246.543.735.543 1.48 0 1.07-.01 1.933-.01 2.195 0 .215.144.463.55.385C13.71 14.53 16 11.534 16 8c0-4.418-3.582-8-8-8"></path></svg>
                      </div>
                      <span>Settle this trip</span>
                    </a>
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
