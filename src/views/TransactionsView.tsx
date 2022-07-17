import * as React from 'react';

import '../App.css';
import { Link } from "react-router-dom";

import { Transaction } from '../model/Transaction';
import { deleteTransactionDB, fetchTransactionsForYearMonth } from '../dataAccess/TransactionDataAccess';

import {
    FormControl, MenuItem, InputLabel, Button, Box, Paper, TableRow, TableHead,
    TableContainer, TableCell, TableBody, Table, Stack, Select, SelectChangeEvent
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface TransactionsViewProps {
    user: string
}

interface TransactionsViewState {
    transactions: Transaction[]
    year: string,
    month: string
    category: string
    categories: string[]
}

const ALL = 'all';
class TransactionsView extends React.Component<TransactionsViewProps, TransactionsViewState> {

    constructor(props: TransactionsViewProps) {
        super(props);
        const date = new Date()
        this.state = {
            transactions: [],
            year: date.getFullYear().toString(),
            month: (date.getMonth()).toString(),
            category: ALL,
            categories: []
        }
        this.componentDidMount = this.componentDidMount.bind(this);
        this.render = this.render.bind(this);
        this.handleYearChange = this.handleYearChange.bind(this);
        this.handleMonthChange = this.handleMonthChange.bind(this);
        this.handleCategoryChange = this.handleCategoryChange.bind(this);
        this.fetchTransactions = this.fetchTransactions.bind(this);
    }

    async componentDidMount() {
        const year = window.location.pathname.split('/')[2]
        const month = window.location.pathname.split('/')[3]
        const category = window.location.pathname.split('/')[4]
        // options
        // 1: year/month/category
        // 2: year/month
        let realMonth = 0;
        if (month) {
            realMonth = parseInt(month) - 1
        }
        if (year && month && category) {
            await this.fetchTransactions(parseInt(year), realMonth, category)
        } else if (year && month && category === undefined) {
            await this.fetchTransactions(parseInt(year), realMonth, this.state.category)
        } else {
            await this.fetchTransactions(parseInt(this.state.year), parseInt(this.state.month), this.state.category)
        }
    }

    async fetchTransactions(year: number, month: number, category: string) {
        let transactions = await fetchTransactionsForYearMonth(this.props.user, year, month + 1)
        const categories: string[] = [ALL]
        for (const transaction of transactions) {
            if (!categories.includes(transaction.category)) {
                categories.push(transaction.category)
            }
        }
        this.setState({ categories })

        transactions = transactions
            .filter((transaction) =>
                category === ALL ? true :
                    transaction.category === category)
            .sort((a, b) => (a.date > b.date) ? -1 : 1)
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
        this.setState({ year: selectedSimulationName });
        this.fetchTransactions(parseInt(selectedSimulationName), parseInt(this.state.month), this.state.category)
    }

    handleMonthChange(event: SelectChangeEvent) {
        const selectedSimulationName = event.target.value as string;
        this.setState({ month: selectedSimulationName })
        this.fetchTransactions(parseInt(this.state.year), parseInt(selectedSimulationName), this.state.category)
    }

    handleCategoryChange(event: SelectChangeEvent) {
        const selectedSimulationName = event.target.value as string;
        this.setState({ category: selectedSimulationName })
        this.fetchTransactions(parseInt(this.state.year), parseInt(this.state.month), selectedSimulationName)
    }

    getYears() {
        const date = new Date();
        let years: string[] = []
        for (let i = date.getFullYear() - 5; i <= date.getFullYear(); i += 1) {
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
        if (this.state.transactions && this.state.categories) {
            let sum = 0.0;
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

                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Category</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={this.state.category}
                            label="category"
                            onChange={this.handleCategoryChange}
                        >
                            {this.state.categories.map((category) => {
                                return (<MenuItem value={category}>{category}</MenuItem>)
                            })}
                        </Select>
                    </FormControl>

                </Stack>
                <br />
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
                            {this.state.transactions.map((transaction: Transaction, idx: number) => {
                                sum += transaction.amount;
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

                            <TableRow
                                key={0}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {``}
                                </TableCell>
                                <TableCell align="center">SUM</TableCell>
                                <TableCell align="center">${sum.toFixed(2)}</TableCell>
                                <TableCell align="center"></TableCell>
                                <TableCell align="center"></TableCell>
                                <TableCell align="center"></TableCell>
                            </TableRow>
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
