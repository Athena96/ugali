import * as React from 'react';
import '../App.css';
import { Auth } from 'aws-amplify';
import { Link } from "react-router-dom";

import Main from './Main';
import AddEditTransactionView from './AddEditTransactionView';

import {
  AppBar, MenuItem, Menu, Dialog, Typography, IconButton, Toolbar, Box
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import { ALL, dateRange } from '../utilities/helpers';
import { fetchTransactionsForYearMonth } from '../dataAccess/TransactionDataAccess';
import { Transaction } from '../model/Transaction';

interface IProps {
  hideSignIn: () => void;
  hideShowSignIn: () => void;
}

interface IState {

  transactions: Transaction[] | undefined;
  categories: string[] | undefined;
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
      addTransactionDialog: false,
      categories: undefined,
      transactions: undefined

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


    /// fetch txns to pass to other views.
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const dates = dateRange(oneYearAgo, today);
    const allTxns: Transaction[] = []
    let categories: string[] = []
    const categoryMap: any = {}

    for (const date of dates) {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const yearMonthTransactions = await fetchTransactionsForYearMonth(email, year, month)
      for (const t of yearMonthTransactions) {
        allTxns.push(t);
        if (!Object.keys(categoryMap).includes(t.category)) {
          categoryMap[t.category] = 0
        }
        categoryMap[t.category] += 1
      }
    }

    const keysSorted = Object.keys(categoryMap).sort(function(a,b){return categoryMap[b]-categoryMap[a]}).slice(0,15)
    categories = keysSorted
    categories.push(ALL)
    this.setState({categories, transactions: allTxns})
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



      return (
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                <Link style={{ color: 'white', textDecoration: 'none' }} to="/">Zen Spending</Link>
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
              {this.state.addTransactionDialog && this.state.user && this.state.categories && 
                <AddEditTransactionView user={this.state.user} categories={this.state.categories} closeDialog={this.closeDialog} />}
            </Dialog>
            {this.state.user && this.state.categories && this.state.transactions ? 
              <Main user={this.state.user} categories={this.state.categories} transactions={this.state.transactions}/> : 
              <Box sx={{ position: 'absolute', top: '50%', left: '50%' }}>
                <CircularProgress />
              </Box>}
          </Box>
        </Box>
      )

  }
}

export default Home;
