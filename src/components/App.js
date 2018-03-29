import React, { Component } from 'react';
import LinkList from './LinkList';
import CreateLink from './CreateLink';

// import logo from '../logo.svg';
// import '../styles/App.css';

class App extends Component {
  render() {
    return (
      <div>
        <CreateLink />
        <LinkList />
      </div>
    )
  }
}

export default App;
