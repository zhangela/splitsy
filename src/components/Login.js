import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import { AUTH_TOKEN, USER_ID } from '../constants';

class Login extends Component {
  state = {
    login: true,
    email: '',
    password: '',
    name: '',
  }

  render() {
    return (
      <div>
        <h4 className="mv3">{this.state.login ? 'Login' : 'Sign Up'}</h4>
        <div className="flex flex-column">

          {!this.state.login && (
            <input
              value={this.state.name}
              onChange={e => this.setState({ name: e.target.value })}
              type="text"
              placeholder="Your name"
            />
          )}

          <input
            value={this.state.email}
            onChange={e => this.setState({ email: e.target.value })}
            type="text"
            placeholder="Your email address"
          />

          <input
            value={this.state.password}
            onChange={e => this.setState({ password: e.target.value })}
            type="password"
            placeholder="Choose a safe password"
          />
        </div>

        <div className="flex mt3">
          <div
            className="pointer mr2 button"
            onClick={() => this._confirm()}
          >
            {this.state.login ? 'Login' : 'Create Account'}
          </div>
          <div
            className="pointer button"
            onClick={() => this.setState({ login: !this.state.login })}
          >
            {this.state.login ?
              'Need to create an account?' :
              'Already have an account?'}
          </div>
        </div>
      </div>
    )
  }

  _confirm = async() => {
    const {name, email, password} = this.state;

    if (this.state.login) {
      const result = await this.props.loginMutation({
        variables: {
          email,
          password,
        },
      });
      const { token, user: { id } } = result.data.login;
      this._saveUserData(token, id);

    } else {
      const result = await this.props.signupMutation({
        variables: {
          name,
          email,
          password,
        },
      });
      const { token, user: { id } } = result.data.signup;
      this._saveUserData(token, id);
    }

    this.props.history.push('/');
  }

  _saveUserData = (token, userId) => {
    localStorage.setItem(AUTH_TOKEN, token);
    localStorage.setItem(USER_ID, userId);

  }
}


const SIGNUP_MUTATION = gql`
  mutation SignupMutation($email: String!, $password: String!, $name: String!) {
    signup(email: $email, password: $password, name: $name) {
      token
      user {
        id
      }
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
      }
    }
  }
`;

export default compose(
  graphql(SIGNUP_MUTATION, {name: 'signupMutation'}),
  graphql(LOGIN_MUTATION, {name: 'loginMutation'}),
)(Login);
