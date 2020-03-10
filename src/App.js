// React
import React, { Component } from 'react';

import { BrowserRouter, Route, Link, Switch } from 'react-router-dom';

// Amplify
import { withAuthenticator } from 'aws-amplify-react';
import API from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from './aws-exports';
import Amplify from 'aws-amplify';
import { Auth } from 'aws-amplify';

// Components
import AddTransaction from "./AddTransaction";
import Transactions from './Transactions';
import Timeline from './Timeline';

// Style
import './App.css';

API.configure(awsconfig);
PubSub.configure(awsconfig);
Amplify.configure(awsconfig);

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { user: "" };
  }

  async signOut() {
    try {
      await Auth.signOut()
      this.props.rerender()

      // this.props.navigation.navigate('Auth')
    } catch (err) {
      console.log('error signing out...', err)
    }
  }

  componentDidMount() {
    Auth.currentAuthenticatedUser().then(user => {
      let email = user.attributes.email;
      this.setState({user: email});
    }).catch((err) => {
        window.alert("Encountered error fetching your username: \n",err);
    });
  }

  render() {
    return (
      <div className="links">
      

      <BrowserRouter>
      
        <div>
          <span class="left">
          <Link className="Link" to="/timeline/">Timeline</Link>
          <Link className="Link" to="/transactions/">Transactions</Link>
          <Link className="Link" to="/addTransaction/">Add Transaction</Link>
          </span>
          <span class="right">
            <b>{ "Hello  " + this.state.user}</b>
            <button class="signOut" onClick={this.signOut} ><b>Sign Out</b></button> <br/>
          </span>​
        </div>

        <div>
          
          <Switch>
            <Route path="/timeline/" component={Timeline} />
            <Route path="/addTransaction/" component={AddTransaction} />
            <Route path="/transactions/" component={Transactions} />
            <Route path="/" component={Transactions} />
          </Switch>

        </div>

      </BrowserRouter>
      </div>
    );
  }

}
export default props =>  {
  const AppComponent = withAuthenticator(App)
  return <AppComponent {...props} />
}
