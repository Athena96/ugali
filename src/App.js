// React
import React, { useEffect } from 'react';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';

// Amplify
import { withAuthenticator } from 'aws-amplify-react';
import API from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from './aws-exports';
import { Hub } from 'aws-amplify';
import Amplify from 'aws-amplify';

// Components
import AddTransaction from "./AddTransaction";
import Transactions from './Transactions';

// Style
import './App.css';

API.configure(awsconfig);
PubSub.configure(awsconfig);
// new
Amplify.configure(awsconfig);


function App() {

  useEffect(() => {

    Hub.listen('auth', (data) => {
      const { payload } = data
      console.log('A new auth event has happened: ', data)
       if (payload.event === 'signIn') {
         console.log('a user has signed in!' + payload.data.attributes.email);
       }
       if (payload.event === 'signOut') {
         console.log('a user has signed out!')
       }
    })
  }, []);

  return (
    <div>
    <div>

    <BrowserRouter>
      <div>
        <Link className="Link" to="/transactions">Transactions</Link>
        <Link className="Link" to="/addTransaction">Add Transaction</Link>
        <Switch>
          <Route path="/addTransaction" component={AddTransaction} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/" component={Transactions} />
        </Switch>
      </div>
    </BrowserRouter>

    </div>
    </div>
  );
}

export default withAuthenticator(App, true);