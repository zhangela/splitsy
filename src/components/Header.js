import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import { AUTH_TOKEN, USER_ID } from '../constants';


class Header extends Component {
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN)
    return (
      <nav className="db dt-l w-100 border-box pa3 ph5-l bg-near-white">
        <a className="db dtc-l v-mid mid-gray link dim w-100 w-25-l tc tl-l mb2 mb0-l" href="#" title="Home">
          <img src="http://tachyons.io/img/logo.jpg" className="dib w2 h2 br-100" alt="Site Name" />
        </a>
        <div className="db dtc-l v-mid w-100 w-75-l tc tr-l">
          <Link className="link dim dark-gray f6 f5-l dib mr3 mr4-l" to="/trip" title="Current Trip">Current Trip</Link>
          <Link className="link dim dark-gray f6 f5-l dib mr3 mr4-l" to="/bank_transactions" title="Transactions">Transactions</Link>

          {authToken ? (
            <div
              className="link dim dark-gray f6 f5-l dib"
              style={{ cursor: "pointer" }}
              onClick={() => {
                localStorage.removeItem(AUTH_TOKEN);
                localStorage.removeItem(USER_ID);
                this.props.history.push(`/`);
              }}
            >
              Log out
            </div>
          ) : (
            <Link to="/login" className="ml1 no-underline black">
              Log in
            </Link>
          )}
        </div>
      </nav>
    )
  }
}

export default withRouter(Header);

