import * as React from 'react';

import '../App.css';
import Box from '@mui/material/Box';
import BudgetProgressView from './BudgetProgressView';
import BudgetGraphView from './BudgetGraphView';
import Stack from '@mui/material/Stack';
import { Transaction } from '../model/Transaction';

interface DashboardViewProps {
  user: string
  transactions: Transaction[]
  categories: string[]
}

interface IState {

}

class DashboardView extends React.Component<DashboardViewProps, IState> {

  constructor(props: DashboardViewProps) {
    super(props);
    this.state = {

    }
    this.componentDidMount = this.componentDidMount.bind(this);
    this.render = this.render.bind(this);

  }

  async componentDidMount() {
  }

  getBudgetProgressView(isMobile: boolean, user: string) {
    return (
      <Stack direction='column' spacing={2} sx={{ width: isMobile ? '100%' : '30%' }}>
        <BudgetProgressView user={user} />
      </Stack>
    )
  }
  getBudgetGraphView(isMobile: boolean, categories: string[], user: string, transactions: Transaction[]) {
    return (
      <Stack direction='column' spacing={2} sx={{ width: isMobile ? '100%' : '70%' }}>
        <BudgetGraphView user={user} categories={categories} transactions={transactions}/>
      </Stack>
    )
  }
  render() {
    const isMobile = window.innerWidth <= 390;

    if (this.props.transactions) {
      return (
        <Box >
          <Stack direction={isMobile ? 'column' : 'row'} spacing={8}>
            {isMobile ? this.getBudgetGraphView(isMobile, this.props.categories, this.props.user, this.props.transactions) : this.getBudgetProgressView(isMobile, this.props.user)}
            {isMobile ? this.getBudgetProgressView(isMobile, this.props.user) : this.getBudgetGraphView(isMobile,this.props.categories, this.props.user, this.props.transactions)}
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
