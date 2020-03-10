// React
import React, { Component } from 'react';

// Amplify
import API, { graphqlOperation } from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from './aws-exports';
import { Auth } from 'aws-amplify';

// graphql
import { listTransactions } from './graphql/queries';

API.configure(awsconfig);
PubSub.configure(awsconfig);

// Constants
const TXN_LIMIT = 100;

class Transactions extends Component {
    constructor(props) {
        console.log("constructor");

        super(props);
        this.state = { balance_rows: [], variable_exp_name: "", variable_exp_amount: "", recurring_txns: [], starting_balance: ""};
        this.handleChange = this.handleChange.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this); 
        this.generateTimeline = this.generateTimeline.bind(this); 
        this.updateTransaction = this.updateTransaction.bind(this); 
    }

    renderTableHeader() {
        let header = ['balance_date', 'balance', 'income', 'income_desc', 'expense', 'expense_desc'];
        return header.map((key, index) => {
            return <th key={index}>{key.toUpperCase()}</th>
        })
    }

    renderTableData() {
        console.log("RENDERING");
        return this.state.balance_rows.map((balance_row, index) => {
            const { id, balanceDate, balance, income, incomeDesc, expense, expenseDesc } = balance_row;
            var year = balanceDate.getFullYear();
            var month = balanceDate.getMonth() + 1;
            var day = balanceDate.getDate();
            console.log(balance_row);
            return (
                <tr key={id}>
                    <td>{year + "-" + month + "-" + day}</td>
                    <td>${balance}</td>
                    <td>{income}</td>
                    <td>{incomeDesc}</td>
                    <td>{expense}</td>
                    <td>{expenseDesc}</td>
                </tr>
            )
        })
    }

    componentDidMount() {

        Auth.currentAuthenticatedUser().then(user => {
            let email = user.attributes.email;

            console.log("Fetching transactions for: " + email);
            API.graphql(graphqlOperation(listTransactions, { 
                limit: TXN_LIMIT,
                filter: {
                    user: { eq: email },
                    is_recurring: { eq: true } 
                } 
            })).then(data => {

                console.log(data);
                var sortedTxns = data.data.listTransactions.items;
                sortedTxns.sort((t1, t2) => {
                    var d1 = new Date(t1.date);
                    var d2 = new Date(t2.date);
                    if (d1 < d2)
                        return 1;
                    if (d1 > d2)
                        return -1;
                    return 0;
                });
                this.setState({ recurring_txns: sortedTxns });

                if (data.data.listTransactions.nextToken !== null) {
                    window.alert("There were some recurring transactions that could not be fetched, so your generated timeline is not accurate.");
                }

            }).catch((err) => {
                window.alert("Encountered error fetching your transactions: \n",err);
            })
            
        }).catch((err) => {
            window.alert("Encountered error fetching your username: \n",err);
        });
        
    }

    updateTransaction(event) {
        this.props.history.push('/AddTransaction/'+event.target.id)
    }

    generateTimeline() {

        // if the user didn't input anything, then look in local storage
            // if its there, then use it and populate the txt fields.
            // else, alert user to input semthing
        // else if the user did input something,
            // if its same as local storage, then continue
            // else, update the local storage value.

        if (this.state.variable_exp_name === null || this.state.variable_exp_name === undefined || this.state.variable_exp_name === "") {
            console.log("no input");

            console.log(localStorage.getItem("variable_exp_name"));

            if (localStorage.getItem("variable_exp_name") != null) {
                console.log("found value in storage");
                console.log(localStorage.getItem("variable_exp_name"));

                this.state.variable_exp_name = localStorage.getItem("variable_exp_name");
            } else {
                window.alert("Must input value for variable spending, name, value and initial balance.");
                return;
            }
        } else {
            if (localStorage.getItem("variable_exp_name") == null || ( localStorage.getItem("variable_exp_name") != null && localStorage.getItem("variable_exp_name") != this.state.variable_exp_name) ) {
                localStorage.setItem("variable_exp_name", this.state.variable_exp_name);
            }
        }

        if (this.state.variable_exp_amount === null || this.state.variable_exp_amount === undefined || this.state.variable_exp_amount == "") {
            if (localStorage.getItem("variable_exp_amount") != null) {
                this.state.variable_exp_amount = localStorage.getItem("variable_exp_amount");
            } else {
                window.alert("Must input value for variable spending, name, value and initial balance.");
                return;
            }
        } else {
            if (localStorage.getItem("variable_exp_amount") == null || ( localStorage.getItem("variable_exp_amount") != null && localStorage.getItem("variable_exp_amount") != this.state.variable_exp_amount) ) {
                localStorage.setItem("variable_exp_amount", this.state.variable_exp_amount);
            }
        }

        if (this.state.starting_balance === null || this.state.starting_balance === undefined || this.state.starting_balance == "") {
            if (localStorage.getItem("starting_balance") != null) {
                this.state.starting_balance = localStorage.getItem("starting_balance");
            } else {
                window.alert("Must input value for variable spending, name, value and initial balance.");
                return;
            }
        } else {
            if (localStorage.getItem("starting_balance") == null || ( localStorage.getItem("starting_balance") != null && localStorage.getItem("starting_balance") != this.state.starting_balance) ) {
                localStorage.setItem("starting_balance", this.state.starting_balance);
            }
        }
        
        var balanceRows = [];
        const DAY_TO_CALCULATE = 31*6;

        var start = new Date();
        start.setDate(start.getDate() - 1);
        var end = new Date();
        end.setDate(start.getDate() + DAY_TO_CALCULATE);

        var currentDay = new Date(start);
        var idx = 0;
        while(currentDay < end){
            
            balanceRows[idx] = {
                id: idx,
                balanceDate: new Date(currentDay),
                balance: (idx === 0) ? parseFloat(this.state.starting_balance).toFixed(2) : parseFloat(balanceRows[idx-1].balance).toFixed(2),
                income: "",
                incomeDesc: "",
                expense: "",
                expenseDesc: ""
            }

            // if any recurring txns happen today, then save them
            var recurringIncomes = [];
            var recurringExpenses = [];
            for (var recurrTxn of this.state.recurring_txns) {
                var recurrTxnDay = parseInt(recurrTxn.date.split('-')[2].split('T')[0]);
                if (recurrTxnDay === currentDay.getDate()) {
                    if (recurrTxn.type === 2) {
                        recurringExpenses.push(recurrTxn);
                    } else {
                        recurringIncomes.push(recurrTxn)
                    }
                }
            }

            // if first day of month... add variable spending
            if (currentDay.getDate() === 1) {
                console.log(currentDay);
                console.log(currentDay.getDate());
                console.log(idx);
                const varSpendingTxn = {
                    title: this.state.variable_exp_name,
                    amount: parseFloat(this.state.variable_exp_amount),
                    is_recurring: true,
                    type: 2
                }
                recurringExpenses.push(varSpendingTxn);
            }

            if (recurringIncomes.length != 0 || recurringExpenses.length != 0) {
                // update balance
                var totalIncome = recurringIncomes.map(item => item.amount).reduce((prev, next) => prev + next, 0.0);
                var totalExpense = recurringExpenses.map(item => item.amount).reduce((prev, next) => prev + next, 0.0);

                balanceRows[idx].balance += totalIncome;
                balanceRows[idx].balance -= totalExpense;

                balanceRows[idx].balance = parseFloat(balanceRows[idx].balance).toFixed(2);
                // update income
                var incomeStr = ""
                var incomeDescStr = ""
                var incomeLinks = [];
                for (var incomeTxn of recurringIncomes) {
                    incomeStr += ("$"+incomeTxn.amount.toString() + ", ");
                    incomeDescStr += (incomeTxn.title + ", ");
                    incomeLinks.push(incomeTxn.id);
                }
                balanceRows[idx].income = incomeStr;
                balanceRows[idx].incomeDesc = incomeDescStr;
                balanceRows[idx].incomeLinks = incomeLinks;

                // update expense
                var expenseStr = ""
                var expenseDescStr = ""
                var expenseLinks = [];
                for (var expenseTxn of recurringExpenses) {
                    expenseStr += ("$"+expenseTxn.amount.toString() + ", ");
                    expenseDescStr += (expenseTxn.title + ", ");
                    expenseLinks.push(expenseTxn.id);
                }
                balanceRows[idx].expense = expenseStr;
                balanceRows[idx].expenseDesc = expenseDescStr;
                balanceRows[idx].expenseLinks = expenseLinks;
            }

            // update currentDay
            var newDate = currentDay.setDate(currentDay.getDate() + 1);
            currentDay = new Date(newDate);
            idx += 1;
        }

        this.setState({
            balance_rows: balanceRows
        });
    }

    handleChange(event) {
        var target = event.target;
        var value = target.value;
        var name = target.name;
        console.log(name);
        console.log(value);

        this.setState({
            [name]: value
        });
    }

    render() {
        return (
            <div>
                <div>
                    <input
                    className="roundedOutline"
                    name="variable_exp_name"
                    type="text"
                    placeholder="variable expense name"
                    value={this.state.variable_exp_name}
                    onChange={this.handleChange} />

                    <input
                    className="roundedOutline"
                    name="variable_exp_amount"
                    placeholder="variable expense amount"
                    type="text"
                    value={this.state.variable_exp_amount}
                    onChange={this.handleChange} />
                    
                    <input
                    className="roundedOutline"
                    name="starting_balance"
                    placeholder="starting balance"
                    type="text"
                    value={this.state.starting_balance}
                    onChange={this.handleChange} />
            
                    <button class="filter" onClick={this.generateTimeline}>generate timeline</button>
                </div>

                <div>
                    <table id='transactions' style={{ height: '100%', width: '100%' }}>
                        <tbody>
                            <tr>{this.renderTableHeader()}</tr>
                            {this.renderTableData()}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default Transactions;
