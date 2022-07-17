import * as React from 'react';

import '../App.css';
import Box from '@mui/material/Box';
import { Transaction } from '../model/Transaction';
import { dateRange } from '../utilities/helpers';
import { fetchTransactionsForYearMonth } from '../dataAccess/TransactionDataAccess';
import { DateDirectory, groupByMonth } from '../utilities/transactionUtils';
import { Line } from "react-chartjs-2";
import { salmonRed } from '../utilities/constants';

interface BudgetGraphViewProps {
    user: string

}

interface IState {
    dateDirectory: DateDirectory[]
}


class BudgetGraphView extends React.Component<BudgetGraphViewProps, IState> {

  constructor(props: BudgetGraphViewProps) {
    super(props);
    this.state = {
        dateDirectory: []
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


    const dateDirectory: DateDirectory[] = groupByMonth(allTxns);
    this.setState({dateDirectory});
  }
  
  getChartData() {
    var chartData: any = {
        labels: [],
        datasets: []
    }

    const lines = [

        {
          name: 'spending',
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
            pointRadius: 1,
        })
    }

    for (const ob of this.state.dateDirectory) {
        // data[`${ob.year}-${ob.month}-01`] = ob.sum;
        chartData.datasets[0].data.push(ob.sum)
        
    }

    return chartData
}

  render() {
    const options = {
 
      };
  

      return (
        <Box >
          <h2>Monthly Spending</h2>

            {this.state.dateDirectory && <Line style={{width: '100%'}} data={this.getChartData()} options={options} />}

        </Box >
        )
  }
}

export default BudgetGraphView;
