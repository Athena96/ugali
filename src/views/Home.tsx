import * as React from 'react';
import '../App.css';

import AppBar from '@mui/material/AppBar';

import { Auth } from 'aws-amplify';
import { MenuItem, Menu, Dialog, Typography, IconButton, Toolbar, Box
} from '@mui/material';

import AccountCircle from '@mui/icons-material/AccountCircle';
import { Link } from "react-router-dom";

import Main from './Main';

import AddIcon from '@mui/icons-material/Add';
import AddTransactionView from './AddEditTransactionView';

interface IProps {
  hideSignIn: () => void;
  hideShowSignIn: () => void;
}

interface IState {
  user: string | undefined;
  profileOpen: boolean;
  addTransactionDialog: boolean;

  txns: Array<{
    __typename: "Transaction",
    id: string,
    title: string,
    amount?: number | null,
    category?: string | null,
    date: string,
    description?: string | null,
    payment_method?: string | null,
    type?: number | null,
    createdAt: string,
    updatedAt: string,
    user: string,
    is_public?: string | null,
  } | null>;

}


class Home extends React.Component<IProps, IState> {

  constructor(props: IProps) {
    super(props);
    this.state = {
      txns: [],
      user: undefined,
      profileOpen: false,
      addTransactionDialog: false

    }
    this.componentDidMount = this.componentDidMount.bind(this);
    this.render = this.render.bind(this);
    this.handleProfileOpen = this.handleProfileOpen.bind(this);
    this.profileClose = this.profileClose.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
    this.handleAddTransaction = this.handleAddTransaction.bind(this);
    this.closeDialog = this.closeDialog.bind(this);

  }

  handleProfileOpen() {
    const curr = this.state.profileOpen;
    this.setState({ profileOpen: !curr });
  }

  profileClose() {
    this.setState({ profileOpen: false });
  }


  async componentDidMount() {
    this.props.hideSignIn();

    const user = await Auth.currentAuthenticatedUser();
    const email: string = user.attributes.email;
    this.setState({ user: email });
  }


  async handleSignOut() {
    try {
      this.props.hideShowSignIn();
      await Auth.signOut();
    } catch (error) {
      console.error('error signing out: ', error);
    }
  }

  handleDeleteAccount() {

  }



  handleAddTransaction() {
    this.setState({ addTransactionDialog: true });
  }


  closeDialog() {
    this.setState({ addTransactionDialog: false });
  }


  render() {

    if (this.state.user) {

      return (
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                <Link style={{ color: 'white', textDecoration: 'none' }} to="/">Money Tomorrow</Link>
                <Link style={{ color: 'white', textDecoration: 'none' }} to="/transactions"><small style={{ marginLeft: '20px' }}>Transactions</small></Link>
                <Link style={{ color: 'white', textDecoration: 'none' }} to="/budget"><small style={{ marginLeft: '20px' }}>Budget</small></Link>

              </Typography>
              <IconButton
                edge="start"
                color="default"
                aria-label="open drawer"
                style={{ color: 'white', marginRight: '20px' }}
                onClick={this.handleAddTransaction}
              >
                <AddIcon />
              </IconButton>

              <IconButton
                edge="start"
                color="default"
                aria-label="open drawer"
                style={{ color: 'white' }}
                onClick={this.handleProfileOpen}
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={this.state.profileOpen}
                onClose={this.profileClose}
              >
                <MenuItem>{this.state.user}</MenuItem>
                <MenuItem sx={{ color: 'red' }} onClick={this.handleDeleteAccount}>Delete Account</MenuItem>
                <MenuItem onClick={this.handleSignOut}>Sign Out</MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <Dialog open={this.state.addTransactionDialog} onClose={this.closeDialog}>
              {this.state.addTransactionDialog && <AddTransactionView user={this.state.user} closeDialog={this.closeDialog} />}
            </Dialog>
            <Main user={this.state.user} />
          </Box>
        </Box>
      )
    } else {
      return (<></>)
    }
  }
}

export default Home;
