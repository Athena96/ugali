import * as React from 'react';

import '../App.css';
import Box from '@mui/material/Box';
import { fetchTransactionsForYearMonth } from '../dataAccess/TransactionDataAccess';
import LinearProgress from '@mui/material/LinearProgress';

import Typography from '@mui/material/Typography';

import { CategoryDirectory, groupTransactionsByCategory } from '../utilities/transactionUtils';
import { getBudgetForUserDB } from '../dataAccess/BudgetDataAccess';
import { Category } from '../model/Category';


interface BudgetProgressViewProps {
  user: string;
}

interface IState {
  categoryMap: CategoryDirectory[] | undefined
}


class BudgetProgressView extends React.Component<BudgetProgressViewProps, IState> {

  constructor(props: BudgetProgressViewProps) {
    super(props);
    this.state = {
      categoryMap: undefined
    }
    this.componentDidMount = this.componentDidMount.bind(this);
    this.render = this.render.bind(this);

  }

  getMatchingTransactions(category: Category, categoryMap: CategoryDirectory[]) {
    for (const map of categoryMap) {
      if (category.name === map.name) {
        const cd: CategoryDirectory = {
          name: map.name,
          transactions: map.transactions,
          sum: map.sum,
          budgetCategory: category
        };
        return cd;
      }
    }
  }

  async componentDidMount() {
    const today = new Date();
    const transactions = await fetchTransactionsForYearMonth(this.props.user, today.getFullYear(), today.getMonth() + 1)
    const categoryMap = groupTransactionsByCategory(transactions)

    let finalCategoryMap: CategoryDirectory[] = []
    const budget = await getBudgetForUserDB(this.props.user);
    if (budget) {
      for (const cat of budget.categories) {
        const matchingTransactions: CategoryDirectory | undefined = this.getMatchingTransactions(cat, categoryMap)
        if (matchingTransactions) {
          finalCategoryMap.push(matchingTransactions)
        }
      }
    } else {
      finalCategoryMap = categoryMap;
    }

    finalCategoryMap.sort((a, b) => (a.sum > b.sum) ? -1 : 1)
    this.setState({ categoryMap: finalCategoryMap });
  }

  getTotalBudget() {
    let sum = 0.0
    if (this.state.categoryMap) {
      for (const c of this.state.categoryMap) {
        sum += c.budgetCategory!.value
      }
    }
    return sum;
  }
  getTotalSpent() {
    let sum = 0.0
    if (this.state.categoryMap) {
      for (const c of this.state.categoryMap) {
        sum += c.sum
      }
    }
    return sum;
  }

  render() {
    if (this.state.categoryMap !== undefined) {
      const totalCanSpend = this.getTotalBudget();
      const totalOfTotalSpent = this.getTotalSpent();
      const percentSpent = (totalOfTotalSpent/totalCanSpend)*100.0
      const isOverTotalBudget = percentSpent > 100.0
      const leftOfTotalToSpend = totalCanSpend - totalOfTotalSpent;
      const leftOrOverMsgTotal = isOverTotalBudget ?  "over budget" : "left to spend";
      return (
        <Box >
          <h2>Budget</h2>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant="determinate" value={percentSpent} />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color={isOverTotalBudget ? "red" : "text.secondary"}>{`$${leftOfTotalToSpend.toFixed(2)} ${leftOrOverMsgTotal}`}</Typography>
                  </Box>
                </Box>
          <hr />
          {this.state.categoryMap.map((category) => {
            const rawSpentCalc = (category.sum / (category.budgetCategory?.value || 0.0))*100.0
            const isOverBudget = rawSpentCalc > 100.0
            const percentSpent = (isOverBudget) ? 100.0 : rawSpentCalc;
            const leftToSpend = (category.budgetCategory!.value-category.sum)
            const leftOrOverMsg = isOverBudget ?  "over budget" : "left to spend";
            return (
              <>
                <h3>{category.name}</h3>
                <p>${category.sum.toFixed(2)}</p>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant="determinate" value={percentSpent} />
                  </Box>
                  <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color={isOverBudget ? "red" : "text.secondary"}>{`$${leftToSpend.toFixed(2)} ${leftOrOverMsg}`}</Typography>
                  </Box>
                </Box>

              </>
            )
          })}
        </Box >
      )
    } else {
      return (<></>)
    }

  }
}

export default BudgetProgressView;
