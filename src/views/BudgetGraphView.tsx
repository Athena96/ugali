import * as React from 'react';

import '../App.css';

import {
  FormControl, Box, Paper, MenuItem, InputLabel, Select, SelectChangeEvent
} from '@mui/material';
import { Transaction } from '../model/Transaction';
import { ALL, dateRange } from '../utilities/helpers';
import { fetchTransactionsForYearMonth } from '../dataAccess/TransactionDataAccess';
import { DateDirectory, groupByMonth } from '../utilities/transactionUtils';
import { Line } from "react-chartjs-2";
import { salmonRed } from '../utilities/constants';
import { Tick } from 'chart.js';

interface BudgetGraphViewProps {
  user: string
  transactions: Transaction[]
  categories: string[]
}

interface IState {
  dateDirectory: DateDirectory[]
  category: string
}


class BudgetGraphView extends React.Component<BudgetGraphViewProps, IState> {

  constructor(props: BudgetGraphViewProps) {
    super(props);
    this.state = {
      dateDirectory: [],
      category: ALL,
    }
    this.componentDidMount = this.componentDidMount.bind(this);
    this.render = this.render.bind(this);
    this.handleCategoryChange = this.handleCategoryChange.bind(this);
    this.filterTransactions = this.filterTransactions.bind(this);

  }

  async componentDidMount() {
    let allTransacions: Transaction[] = []
    if (this.props.transactions) {
      allTransacions = this.props.transactions;
    } else {
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const dates = dateRange(oneYearAgo, today);
      const allTxns: Transaction[] = []
      for (const date of dates) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const yearMonthTransactions = await fetchTransactionsForYearMonth(this.props.user, year, month)
        for (const t of yearMonthTransactions) {
          allTxns.push(t);
        }
      }
      allTransacions = allTxns
    }

    const dateDirectory: DateDirectory[] = groupByMonth(allTransacions);

    this.setState({ dateDirectory });
  }

  filterTransactions(category: string) {
    const transactions = this.props.transactions
      .filter((transaction) =>
        category === ALL ? true :
          transaction.category === category)
    const dateDirectory: DateDirectory[] = groupByMonth(transactions);
    this.setState({ dateDirectory })
  }

  getChartData() {
    var chartData: any = {
      labels: [],
      datasets: []
    }

    const lines = [
      {
        name: this.state.category === ALL ? "Total Spending" : this.state.category,
        color: salmonRed,
        key: 'spending'
      }
    ]

    for (const ob of this.state.dateDirectory) {
      chartData.labels.push(`${ob.month}/${ob.year}`)
    }

    for (const line of lines) {
      chartData.datasets.push({
        label: line.name,
        data: [],
        borderColor: line.color,
        pointBorderWidth: 1,
        lineTension: 0.25,

      })
    }

    for (const ob of this.state.dateDirectory) {
      chartData.datasets[0].data.push(ob.sum)
    }

    return chartData
  }

  handleCategoryChange(event: SelectChangeEvent) {
    const selectedSimulationName = event.target.value as string;
    this.setState({ category: selectedSimulationName })
    this.filterTransactions(selectedSimulationName);
  }

  getTxnMax() {
    let max = 0.0
    for (const dir of this.state.dateDirectory) {
      if (dir.sum > max) {
        max = dir.sum;
      }
    }

    // if max is 766 if returns 800
    let next100 = Math.round((max + 100) / 100) * 100;
    return next100;
  }


  render() {
    const mx = Math.round(this.getTxnMax() * 1.25);
    const isMobile = window.innerWidth <= 390;
    const options = {
      scales: {
        y: {
          min: 0,
          max: mx,
          ticks: {
            callback: function (tickValue: string | number, index: number, ticks: Tick[]) {
              if ((tickValue as number) >= 1000000) {
                return '$' + (tickValue as number) / 1000000 + ' M'
              } else if ((tickValue as number) <= -1000000) {
                return '$' + (tickValue as number) / 1000000 + ' M'
              } else {
                return '$' + (tickValue as number);
              }
            }
          }
        },
        x: {
          display: isMobile ? true : false
        }

      },
      plugins: {
        legend: {
          position: "bottom" as const,
          display: isMobile ? false : true,
        },

      }
    };

    return (
      <Paper elevation={3}>

        <Box sx={{ margin: '10px' }}>
          <h2>Monthly Spending</h2>
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Category</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={this.state.category}
              label="category"
              onChange={this.handleCategoryChange}
            >
              {this.props.categories.map((category) => {
                return (<MenuItem key={category} value={category}>{category}</MenuItem>)
              })}
            </Select>
          </FormControl>
          <br />
          <br />
          {this.state.dateDirectory && <Line style={{ width: '100%' }} data={this.getChartData()} options={options} />}
        </Box >
      </Paper>

    )
  }
}

export default BudgetGraphView;
