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
import { ALL } from '../utilities/helpers';

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
        let year = window.location.pathname.split('/')[2]
        let month = window.location.pathname.split('/')[3]
        let category = window.location.pathname.split('/')[4]
        if (!year) {
            year = this.state.year
        }
        if (!category) {
            category = this.state.category
        }

        if (month) {
            const realMonth = parseInt(month) - 1
            month = String(realMonth);
        } else {
            month = this.state.month
        }

        if (year && month && category) {
            this.setState({ year, month, category })
        } else if (year && month && category === undefined) {
            this.setState({ year, month, category: ALL })
        }
        await this.loadPageData(parseInt(year), parseInt(month), category);
    }

    async loadPageData(year: number, month: number, category: string) {
        let transactions: Transaction[] = await this.fetchTransactions(year, month);
        let categories = this.getCategoriesFromTransactions(transactions);
        transactions = this.filterTransactionsByCategory(transactions, category).sort((a, b) => (a.date > b.date) ? -1 : 1);
        this.setState({ categories, transactions });
    }

    getCategoriesFromTransactions(transactions: Transaction[]): string[] {
        const categories: Set<string> = new Set([ALL])
        transactions.forEach((transaction) => {
            categories.add(transaction.category);
        })
        return Array.from(categories);
    }

    filterTransactionsByCategory(transactions: Transaction[], category: string): Transaction[] {
        return transactions.filter((transaction) =>
            category === ALL ? true :
                transaction.category === category);
    }

    async fetchTransactions(year: number, month: number) {
        return await fetchTransactionsForYearMonth(this.props.user, year, month + 1)
    }

    async deleteTransaction(transaction: Transaction) {
        const idToDelete = transaction.id;
        await deleteTransactionDB(idToDelete);
        const transactions = this.state.transactions.filter((transaction) => transaction.id !== idToDelete);
        this.setState({ transactions })
    }

    handleYearChange(event: SelectChangeEvent) {
        const newYear = event.target.value as string;
        this.setState({ year: newYear });
        this.loadPageData(parseInt(newYear), parseInt(this.state.month), this.state.category)
    }

    handleMonthChange(event: SelectChangeEvent) {
        const newMonth = event.target.value as string;
        this.setState({ month: newMonth })
        this.loadPageData(parseInt(this.state.year), parseInt(newMonth), this.state.category)
    }

    handleCategoryChange(event: SelectChangeEvent) {
        const newCategory = event.target.value as string;
        this.setState({ category: newCategory })
        this.loadPageData(parseInt(this.state.year), parseInt(this.state.month), newCategory)
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
            return (
                <Paper elevation={3}>
                    <Box sx={{ margin: '10px' }}>
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
                                        return (<MenuItem key={year} value={year}>{year}</MenuItem>)
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
                                        return (<MenuItem key={i} value={i}>{month}</MenuItem>)
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
                                        return (<MenuItem key={category} value={category}>{category}</MenuItem>)
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
                </Paper>
            )
        } else {
            return (
                <></>
            )
        }
    }
}

export default TransactionsView;
