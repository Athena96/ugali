// React
import React, { Component } from 'react';

// React MDL
import { Navbar, Nav } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    if (this.props.authState === "signedIn") {
    return (
      <div className="main">
        {/* <Layout fixedHeader> */}
          
        <Navbar className="color-nav" variant="dark" fixed="top"  collapseOnSelect expand="lg">
          <Navbar.Brand href="/home"><b>ZenSpending</b></Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">

          <Nav className="mr-auto">
            <Nav.Link href="/transactions">Transactions</Nav.Link>
            <Nav.Link href="/addTransaction">Add Transaction</Nav.Link>
            <Nav.Link onClick={this.signOut}><b>Sign Out</b></Nav.Link>


          </Nav>
          </Navbar.Collapse>
        </Navbar>

        
            <div >
            <Main />
            </div>

          {/* <footer class="footer">
            <p class="footerText"><small>© Copyright ZenSpending.com - All rights reserved </small></p>
          </footer> */}
        {/* </Layout> */}
      </div>
    );
    } else {
      return null;
    }
  }

}

export default App;

