import React, { Component } from 'react';
import { Switch, Route} from 'react-router-dom';
import Header from './Header';
import LinkList from './LinkList';
import CreateLink from './CreateLink';
import Login from './Login';
import Search from './Search';
import BankTransactionList from './BankTransactionList';
import Home from './Home';

// import logo from '../logo.svg';
// import '../styles/App.css';

class App extends Component {
  render() {
    return (
      <div className="center">
        <Header />
        <div className="ph3 pv1">
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/create" component={CreateLink} />
            <Route exact path="/login" component={Login} />
            <Route exact path='/search' component={Search}/>
            <Route exact path="/bank_transactions" component={BankTransactionList} />
          </Switch>
        </div>
      </div>
    )
  }
}

export default App;
