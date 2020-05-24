// React
import React, { Component } from 'react';

// React MDL
import { Layout, Header, Navigation, Drawer, Content } from 'react-mdl';
import { Link } from 'react-router-dom';

// Amplify
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
      this.window.open('/');
      this.props.rerender()
    } catch (err) {
      console.log(err)
    }
  }

  componentDidMount() {
    Auth.currentAuthenticatedUser().then(user => {
      let email = user.attributes.email;
      this.setState({ user: email });
    }).catch((err) => {
      // window.alert("Encountered error fetching your username: \n", err);
    });
  }

  render() {
    if (this.props.authState == "signedIn") {

    return (
      <div className="demo-big-content">
        <Layout fixedHeader>
          <Header style={{ backgroundColor: 'rgb(255, 124, 123)' }}  seamed>
            <Navigation>
              <Link to="/timeTravel">Time Travel</Link>
              <Link to="/transactions">Transactions</Link>
              <Link to="/friends">Friends</Link>
              <Link to="/addTransaction">Add Transaction</Link>
            </Navigation>
            {/* <b>{this.state.users}</b> */}
            {/* <button class="signOut" onClick={this.signOut} ><b>Sign Out</b></button> <br /> */}
          </Header>
          <Drawer title={<Link style={{ textDecoration: 'none', color: 'black' }} to="/">Zen Spending</Link>}>
            <Navigation>
              <Link to="/timeTravel">Time Travel</Link>
              <Link to="/transactions">Transactions</Link>
              <Link to="/friends">Friends</Link>
              <Link to="/addTransaction">Add Transaction</Link>
              <Link to="/about">About</Link>
            </Navigation>
            <p align="center"><b>{this.state.user}</b></p>
            <button class="signOut" onClick={this.signOut} ><b>Sign Out</b></button> <br />
          </Drawer>
          <Content>
            <div className="page-content">
            <Main />
            </div>

          </Content>
          <footer class="footer">
            <p class="footerText"><small>© Copyright ZenSpending.com - All rights reserved </small></p>
          </footer>
        </Layout>
      </div>
    );
    } else {
      return null;
    }
  }

}

export default App;

