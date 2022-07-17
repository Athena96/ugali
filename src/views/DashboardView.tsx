import * as React from 'react';

import '../App.css';
import Box from '@mui/material/Box';
import BudgetProgressView from './BudgetProgressView';
import BudgetGraphView from './BudgetGraphView';
import Stack from '@mui/material/Stack';
import { Transaction } from '../model/Transaction';
import { dateRange } from '../utilities/helpers';
import { fetchTransactionsForYearMonth } from '../dataAccess/TransactionDataAccess';


interface DashboardViewProps {
  user: string
}

interface IState {
transactions: Transaction[]
}


class DashboardView extends React.Component<DashboardViewProps, IState> {

  constructor(props: DashboardViewProps) {
    super(props);
    this.state = {
      transactions: []
    }
    this.componentDidMount = this.componentDidMount.bind(this);
    this.render = this.render.bind(this);

  }

 async componentDidMount() {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear()-1);
    const dates = dateRange(oneYearAgo, today);
    const allTxns: Transaction[] = []
    for (const date of dates) {
        
        const year = date.getFullYear();
        const month = date.getMonth()+1;
        const yearMonthTransactions = await fetchTransactionsForYearMonth(this.props.user, year, month)

        for (const t of yearMonthTransactions) {

            allTxns.push(t);
        }

    }

    this.setState({transactions: allTxns})
  }


  render() {
    const isMobile = window.innerWidth <= 390;

    if (this.state.transactions) {
      return (
        <Box >
          <Stack direction={isMobile ? 'column' : 'row'} spacing={8}>
            <Stack direction='column' spacing={2} sx={{width: isMobile ? '100%' : '25%'}}>
              <BudgetProgressView user={this.props.user}/>
            </Stack>
            <Stack direction='column' spacing={2} sx={{width: isMobile ? '100%' : '75%'}}>
              <BudgetGraphView user={this.props.user}/>
            </Stack>
          </Stack>
        </Box >
      )
    } else {
      return (
        <p>loading...</p>
      )
    }

  }
}

export default DashboardView;
