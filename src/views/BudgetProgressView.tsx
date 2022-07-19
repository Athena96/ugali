import * as React from 'react';

import '../App.css';
import Box from '@mui/material/Box';
import { fetchTransactionsForYearMonth } from '../dataAccess/TransactionDataAccess';
import { CategoryDirectory, groupTransactionsByCategory } from '../utilities/transactionUtils';
import { getBudgetForUserDB } from '../dataAccess/BudgetDataAccess';
import { Category } from '../model/Category';
import { Budget } from '../model/Budget';
import { Link } from 'react-router-dom';
import BudgetComponent from '../components/BudgetComponent';

interface BudgetProgressViewProps {
  user: string;
}

interface IState {
  categoryMap: CategoryDirectory[] | undefined
  budget: Budget | undefined
}

class BudgetProgressView extends React.Component<BudgetProgressViewProps, IState> {

  constructor(props: BudgetProgressViewProps) {
    super(props);
    this.state = {
      categoryMap: undefined,
      budget: undefined
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
      this.setState({ budget })
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
    if (this.state.budget && this.state.budget.categories) {
      for (const c of this.state.budget.categories) {
        sum += c.value
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
      const percentSpent = (totalOfTotalSpent / totalCanSpend) * 100.0
      const isOverTotalBudget = percentSpent > 100.0
      const today = new Date();
      const year = today.getFullYear()
      const month = today.getMonth() + 1;
      return (
        <Box >
          <h2><Link style={{ color: 'black', textDecoration: 'none' }} to={`/transactions/${year}/${month}`}>Budget</Link></h2>
          <BudgetComponent year={year} month={month} category={{
            name: 'Total',
            transactions: [],
            sum: totalOfTotalSpent,
            budgetCategory: new Category('1',
              '',
              totalCanSpend)
          }} percentSpent={percentSpent} isOverBudget={isOverTotalBudget} isMaster={true} />
          <hr />
          {this.state.categoryMap.map((category) => {
            const rawSpentCalc = (category.sum / (category.budgetCategory?.value || 0.0)) * 100.0
            const isOverBudget = rawSpentCalc > 100.0
            const percentSpent = (isOverBudget) ? 100.0 : rawSpentCalc;
            return (
              <BudgetComponent year={year} month={month} category={category} percentSpent={percentSpent} isOverBudget={isOverBudget} />
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
