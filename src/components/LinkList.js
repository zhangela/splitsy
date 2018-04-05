import React, { Component } from 'react';
import Link from './Link';

import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

class LinkList extends Component {

  componentDidMount() {
    this._subscribeToNewLinks();
    this._subscribeToNewVotes();
  }

  render() {
    if (this.props.feedQuery && this.props.feedQuery.loading) {
      return <div>Loading</div>;
    }

    if (this.props.feedQuery && this.props.feedQuery.error) {
      return <div>Error</div>;
    }

    const linksToRender = this.props.feedQuery.feed.links;

    return (
      <div>
        {linksToRender.map((link, index) => (
          <Link 
            key={link.id} 
            index={index} 
            link={link} 
            updateStoreAfterVote={this._updateCacheAfterVote}
          />
        ))}
      </div>
    )
  }

  _updateCacheAfterVote = (store, createVote, linkId) => {
    const data = store.readQuery({ query: FEED_QUERY});

    const votedLink = data.feed.links.find(link => link.id === linkId);
    votedLink.votes = createVote.link.votes;

    store.writeQuery({ query: FEED_QUERY, data });
  }

  _subscribeToNewLinks = () => {
    this.props.feedQuery.subscribeToMore({
      document: gql`
        subscription {
          newLink {
            node {
              id
              url
              description
              createdAt
              postedBy {
                id
                name
              }
              votes {
                id
                user {
                  id
                }
              }
            }
          }
        }
      `,

      updateQuery: (previous, { subscriptionData }) => {
        const newAllLinks = [
          ...previous.feed.links,
          subscriptionData.data.newLink.node          
        ];

        const result = {       
          ...previous,
          feed: {
            links: newAllLinks,
            __typename: previous.feed.__typename,   
          },
        };
        return result;
      }
    });
  }

  _subscribeToNewVotes = () => {
    console.log("_subscribeToNewVotes");
    this.props.feedQuery.subscribeToMore({
      document: gql`
        subscription {
          newVote {
            node {
              id
              link {
                id
                url
                description
                createdAt
                postedBy {
                  id
                  name
                }
              }
              user {
                id
              }
            }
          }
        }
      `,
      updateQuery: (previous, { subscriptionData }) => {
        console.log(previous, subscriptionData);
        // TODO: fix this so it actually live updates
        // previous = {feed: {links: ...}}
        // subscriptionData = {data: {newVote: {node: {id, link, user}}}}  -> a vote
      }
    });
  }
}




export const FEED_QUERY = gql`
  query FeedQuery {
    feed {
      links {
        id
        createdAt
        description
        url
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`;

// the data will be available through this.props.feedQuery instead of this.props.data
export default graphql(FEED_QUERY, { name: 'feedQuery'}) (LinkList)