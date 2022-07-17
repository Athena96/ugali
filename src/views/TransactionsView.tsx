import * as React from 'react';

import '../App.css';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Transaction } from '../model/Transaction';
import { deleteTransactionDB, fetchTransactionsForYearMonth } from '../dataAccess/TransactionDataAccess';
import { Link } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from '@mui/material';
interface TransactionsViewProps {
    user: string

}

interface IState {
    transactions: Transaction[]
}


class TransactionsView extends React.Component<TransactionsViewProps, IState> {

  constructor(props: TransactionsViewProps) {
    super(props);
    this.state = {
        transactions: []
    }
    this.componentDidMount = this.componentDidMount.bind(this);
    this.render = this.render.bind(this);

  }

  async componentDidMount() {
    const today = new Date();

    const transactions = await fetchTransactionsForYearMonth(this.props.user, today.getFullYear(), today.getMonth() + 1)
    transactions.sort((a, b) => (a.date > b.date) ? -1 : 1)

    this.setState({transactions})
  }

  async deleteTransaction(transaction: Transaction) {
    const idToDelete = transaction.id;
    await deleteTransactionDB(idToDelete);
    const transactions = this.state.transactions.filter((transaction) => transaction.id !== idToDelete);
    this.setState({transactions})
  }
  
  render() {
    if (this.state.transactions) {
        return (<Box>
            <h2>Transactions</h2>

            <TableContainer component={Paper}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell align="center">Title</TableCell>
                            <TableCell align="center">Amount</TableCell>
                            <TableCell align="center">Category</TableCell>
                            <TableCell align="center">Updated At</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.state.transactions.map((transaction: Transaction) => {
           
                                return (
                                    <TableRow
                                    key={transaction.id}
                                    
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                                                        

                                    <TableCell component="th" scope="row">
                                        {`${transaction.date.getMonth() + 1}/${transaction.date.getDate()}/${transaction.date.getFullYear()}`}
                                    </TableCell>

                                    <TableCell align="center"><Link to={`/transaction/${transaction.id}`}>{transaction.title} </Link></TableCell>
                                    <TableCell align="center">${Number(transaction.amount).toFixed(2)}</TableCell>
                                    <TableCell align="center">{transaction.category}</TableCell>
                                    <TableCell component="th" scope="row">
                                        {`${transaction.updatedAt.getMonth() + 1}/${transaction.updatedAt.getDate()}/${transaction.updatedAt.getFullYear()}`}
                                    </TableCell>
                                    <TableCell component="th" scope="row">
                                        <Button onClick={(e) => this.deleteTransaction(transaction)}><DeleteIcon /></Button>
                                    </TableCell>

                                </TableRow>
                                )
                    })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
        )
    } else {
        return (
            <></>
        )
    }
  }
}

export default TransactionsView;
