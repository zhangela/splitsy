import React, { Component } from 'react';
import { Query, withApollo } from 'react-apollo';
import gql from 'graphql-tag';

import { USER_ID } from '../constants';
import CreateTrip from './CreateTrip';

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
          } else {
            return (
              <div>
                You have a trip!
                {data.currentTrip.id}
                {data.currentTrip.name}
                {data.currentTrip.users.map((user) => {
                  return <div key={user.id}>{user.name}</div>
                })}
              </div>
            );
          }
        }}
      </Query>
    );
  }
}

const CURRENT_TRIP_QUERY = gql`
  query CurrentTripQuery($userId: String!) {
    currentTrip(userId: $userId) {
      id
      name
      users {
        id
        name
      }
    }
  }
`;

export default withApollo(Trip);
