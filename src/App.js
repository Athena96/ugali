// React
import React, { Component } from 'react';

import { BrowserRouter, Route, Switch } from 'react-router-dom';

// React MDL
import { Layout, Header, Navigation, Drawer, Content } from 'react-mdl';
import { Link } from 'react-router-dom';

// Amplify
import { withAuthenticator } from 'aws-amplify-react';
import API from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from './aws-exports';
import Amplify from 'aws-amplify';
import { Auth } from 'aws-amplify';

// Components
import Main from './components/main';

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
      <div className="demo-big-content">
    <Layout fixedHeader>
        <Header style={{backgroundColor: 'rgb(255, 124, 123)'}} title={<Link style={{textDecoration: 'none', color: 'white'}} to="/">Zen Spending</Link>} scroll>
            <Navigation>
                <Link to="/timeline">Timeline</Link>
                <Link to="/transactions">Transactions</Link>
                <Link to="/addTransaction">Add Transaction</Link>
            </Navigation>
              <b>{this.state.user}</b>
              <button class="signOut" onClick={this.signOut} ><b>Sign Out</b></button> <br/>
        </Header>
        <Drawer title={<Link style={{textDecoration: 'none', color: 'black'}} to="/">Zen Spending</Link>}>
            <Navigation>
              <Link to="/timeline">Timeline</Link>
              <Link to="/transactions">Transactions</Link>
              <Link to="/addTransaction">Add Transaction</Link>
            </Navigation>
            <b>{this.state.user}</b>
              <button class="signOut" onClick={this.signOut} ><b>Sign Out</b></button> <br/>
        </Drawer>
        <Content>
            <div className="page-content"> 
            
            <Main/>
            </div>
            
        </Content>
    </Layout>
</div>
    );
  }

}
export default props =>  {
  const AppComponent = withAuthenticator(App)
  return <AppComponent {...props} />
}
