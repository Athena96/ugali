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

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';


interface TransactionsViewProps {
    user: string

}

interface IState {
    transactions: Transaction[]
    year: string,
    month: string
}


class TransactionsView extends React.Component<TransactionsViewProps, IState> {

    constructor(props: TransactionsViewProps) {
        super(props);
        const date = new Date()

        this.state = {
            transactions: [],
            year: date.getFullYear().toString(),
            month: (date.getMonth()).toString()
        }
        this.componentDidMount = this.componentDidMount.bind(this);
        this.render = this.render.bind(this);
        this.handleYearChange = this.handleYearChange.bind(this);
        this.handleMonthChange = this.handleMonthChange.bind(this);
        this.fetchTransactions = this.fetchTransactions.bind(this);
    }

    async componentDidMount() {
        await this.fetchTransactions(parseInt(this.state.year), parseInt(this.state.month))
    }

    async fetchTransactions(year: number, month: number) {
        console.log('fetchTransactions')
        console.log(parseInt(this.state.year), parseInt(this.state.month))


        const transactions = await fetchTransactionsForYearMonth(this.props.user, year, month+1)
        transactions.sort((a, b) => (a.date > b.date) ? -1 : 1)
        this.setState({ transactions })
    }

    async deleteTransaction(transaction: Transaction) {
        const idToDelete = transaction.id;
        await deleteTransactionDB(idToDelete);
        const transactions = this.state.transactions.filter((transaction) => transaction.id !== idToDelete);
        this.setState({ transactions })
    }

    handleYearChange(event: SelectChangeEvent) {

        const selectedSimulationName = event.target.value as string;
        this.setState({year: selectedSimulationName});
        this.fetchTransactions(parseInt(selectedSimulationName),parseInt(this.state.month))
    }

    handleMonthChange(event: SelectChangeEvent) {

        const selectedSimulationName = event.target.value as string;
        this.setState({month: selectedSimulationName})
        this.fetchTransactions(parseInt(this.state.year),parseInt(selectedSimulationName))

    }

    getYears() {
        const date = new Date();
        let years: string[] = []
        for (let i = date.getFullYear()-5; i <= date.getFullYear(); i += 1 ) {
            years.push(i.toString());
        }
        return years;
    }

    getMonths() {
        let months: string[] = []
        months.push('January');
        months.push('February');
        months.push('March');
        months.push('April');
        months.push('May');
        months.push('June');
        months.push('July');
        months.push('August');
        months.push('September');
        months.push('October');
        months.push('November');
        months.push('December');


        return months;
    }
    render() {
        if (this.state.transactions) {
            return (<Box>
                <h2>Transactions</h2>
                <Stack direction='row' spacing={2}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Age</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={this.state.year}
                        label="year"
                        onChange={this.handleYearChange}
                    >
                        {this.getYears().map((year) => {
                            
                            return (<MenuItem value={year}>{year}</MenuItem>)

                        })}
                    </Select>
                </FormControl>
             
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Month</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={this.state.month}
                        label="month"
                        onChange={this.handleMonthChange}
                    >
                        {this.getMonths().map((month, i) => {
                            
                            return (<MenuItem value={i}>{month}</MenuItem>)

                        })}
                    </Select>
                </FormControl>
                </Stack>
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
