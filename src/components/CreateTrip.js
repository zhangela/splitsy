import React, { Component } from 'react';
import { Mutation, Query } from 'react-apollo';
import gql from 'graphql-tag';

import { USER_ID } from '../constants';

class CreateTrip extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      userIds: new Set([localStorage.getItem(USER_ID)]),
    };
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleUserCheckboxChange = (event) => {
    const target = event.target;

    const userIds = this.state.userIds;
    if (target.checked) {
      userIds.add(target.value);
    } else {
      userIds.delete(target.value);
    }

    this.setState({
      userIds: userIds
    });
  }

  render() {

    const currentUserId = localStorage.getItem(USER_ID);

    return (
      <Mutation mutation={CREATE_TRIP_MUTATION}>
        {(createTrip, { data }) => (
          <article className="pa4 black-80">
            <h2 className="lh-solid">Create Trip</h2>

            <form onSubmit={e => {
              e.preventDefault();
              createTrip({
                variables: {
                  name: this.state.name,
                  userIds: Array.from(this.state.userIds),
                }
              });
            }}>
              <fieldset className="ba b--transparent ph0 mh0">

                <div className="mt3">
                  <label className="db fw4 lh-copy f6">
                    <span className="b">Trip Name:</span>
                    <div>
                      <input
                        name="name"
                        type="text"
                        value={this.state.name}
                        onChange={this.handleInputChange}
                        className="pa2 input-reset ba bg-transparent w-100 measure"
                      />
                    </div>
                  </label>
                </div>

                <div className="mt3">
                  <label className="db fw4 lh-copy f6">
                    <span className="b">Participants:</span>

                    <Query query={AVAILABLE_USERS_QUERY} variables={{ userId: currentUserId }}>
                      {({ loading, error, data }) => {
                        if (loading) {
                          return <div>Loading...</div>
                        }
                        if (error) {
                          return <div>There's an error :(</div>
                        }

                        if (!data.availableUsers || data.availableUsers.length === 0) {
                          return <div>No available users.</div>
                        }

                        return (
                          data.availableUsers.map(({ id: userId, name }) => {
                              return (
                                <label className="checkbox" key={userId}>
                                  <div className="lh-copy pv3 ba bl-0 bt-0 br-0 b--dotted b--black-30">
                                    <input
                                      type="checkbox"
                                      className="mr2"
                                      name="userIds"
                                      value={userId}
                                      onChange={this.handleUserCheckboxChange}
                                      defaultChecked={this.state.userIds.has(userId)}
                                    />
                                    <span>
                                      {name} {userId === currentUserId && " (you)"}
                                    </span>
                                  </div>
                                </label>
                              );
                            })
                        );

                      }}
                    </Query>

                  </label>
                </div>
              </fieldset>

              <div className="mt3">
                <input
                  className="ph3 pv2 input-reset ba b--black bg-transparent grow pointer f6"
                  type="submit"
                  value="Create trip"
                />
              </div>

            </form>
          </article>
        )

        }
      </Mutation>
    );
  }
}

const AVAILABLE_USERS_QUERY = gql`
  query AvailableUsersQuery($userId: String!) {
    availableUsers(userId: $userId) {
      id
      name
    }
  }
`;

const CREATE_TRIP_MUTATION = gql`
  mutation CreateTripMutation(
    $name: String!
    $userIds: [String!]!
  ){
    createTrip(name: $name, userIds: $userIds) {
      id
    }
  }
`;

export default CreateTrip;
