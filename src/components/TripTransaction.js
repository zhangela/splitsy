import React, { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import { USER_ID } from '../constants';
import { CURRENT_TRIP_QUERY } from './Trip';
import { REMOVE_TRANSACTION_FROM_TRIP_MUTATION } from './Transaction';

class TripTransaction extends Component {

  state = {
    imageUrl: "https://cdn.pixabay.com/photo/2017/11/10/04/47/image-2935360_1280.png",
  }

  componentDidMount() {
    this._getTransactionImage();
  }

  render() {

    const currentUserId = localStorage.getItem(USER_ID);
    const t = this.props.tripTransaction;
    return (
      <article className="dt w-100 bb b--black-05 pb2 mt2">
        <div className="dtc w2 w3-ns v-mid">
          <img
            src={this.state.imageUrl}
            className="ba b--black-10 db br-100 w2 w3-ns h2 h3-ns"
            alt={t.category}
          />
        </div>


        <div className="cf">

          <div className="pa3 fl w-25 pv3">
            <h1 className="f6 f5-ns fw6 black mv0">
              {t.name}
            </h1>
            <h2 className="f6 fw4 mt0 mb0 black-60">
              {t.date}
            </h2>
          </div>

          <div className="pa3 fl w-25 pv3">
            <h2 className="f6 fw4 mt0 mb0 black-60">
              ${t.amount}
            </h2>
          </div>

          <div className="pa3 fl w-25 pv3">
            <h2 className="f6 fw4 mt0 mb0 black-60">
              {t.category && t.category[0]}
            </h2>
          </div>

          <Mutation mutation={REMOVE_TRANSACTION_FROM_TRIP_MUTATION}>
            {(removeTransactionFromTrip, { data }) => (
              <div className="fl w-25 tc pv3">
                <form className="w-100 tr">
                  <button
                    className="f6 button-reset bg-light-gray ba b--black-10 dim pointer pv1 black-60"
                    type="submit"
                    onClick={e => {
                      e.preventDefault();
                      removeTransactionFromTrip({
                        variables: {
                          tripId: t.trip.id,
                          plaidTransactionId: t.plaidTransactionId,
                        }
                      });
                    }}
                  >
                   <img
                    src="https://cdn3.iconfinder.com/data/icons/line/36/no_entry-16.png"
                    style={{paddingTop: "4px", marginRight: "4px"}}
                  />
                  Remove
                  </button>
                </form>
              </div>
            )}
          </Mutation>

        </div>

      </article>
    )
  }

  async _getTransactionImage() {
    if (!this.props.tripTransaction.category) {
      return;
    }

    const category = this.props.tripTransaction.category[0];

    const response = await fetch(
      'https://pixabay.com/api/?' +

      // TODO: BAD!!! I really shouldn't be committing this key here
      'key=8632845-58f0d8df35bfbbf3444bc23da' +
      '&image_type=photo' +
      '&q=' + category.replace(new RegExp(' ', 'g'), '+')
    );

    const imageData = await response.json();

    if (imageData.hits && imageData.hits[0] && imageData.hits[0].previewURL) {
      this.setState({ imageUrl: imageData.hits[0].previewURL });
    }
  }
}

export default TripTransaction;
