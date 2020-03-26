// React
import React, { Component } from 'react';

import LineChart from 'react-linechart';
import '../../node_modules/react-linechart/dist/styles.css';

// Amplify
import API, { graphqlOperation } from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from '../aws-exports';
import { Auth } from 'aws-amplify';

// graphql
import { listTransactions } from '../graphql/queries';
import { createTransaction } from '../graphql/mutations';

import { getDoubleDigitFormat, convertDateStrToGraphqlDate } from '../common/Utilities';

API.configure(awsconfig);
PubSub.configure(awsconfig);

// Constants
const TXN_LIMIT = 100;

class TimeTravel extends Component {
    constructor(props) {
        super(props);
        this.state = { balance_rows: [], variable_exp_name: "", variable_exp_amount: "", recurring_txns: [], starting_balance: "" };
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
        return this.state.balance_rows.map((balance_row, index) => {
            const { id, balanceDate, balance, income, incomeDesc, expense, expenseDesc } = balance_row;
            var year = balanceDate.getFullYear();
            var month = balanceDate.getMonth() + 1;
            var day = balanceDate.getDate();
            const dayIdx = balanceDate.getDay();
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            var dayOfWeek = days[dayIdx];
            var weekDay = <td>{year + "-" + month + "-" + day + " " + dayOfWeek}</td>;
            if (dayIdx === 0 || dayIdx === 6) {
                weekDay = <td><b>{year + "-" + month + "-" + day + " " + dayOfWeek}</b></td>;
            }
            return (
                <tr key={id}>
                    {weekDay}
                    <td>${parseFloat(balance).toFixed(2)}</td>
                    <td>{income}</td>
                    <td>{incomeDesc}</td>
                    <td>{expense}</td>
                    <td>{expenseDesc}</td>
                </tr>
            )
        })
    }

    componentDidMount() {
        // check local storage for saved values, if have some, populate the fields with it.
        if (localStorage.getItem("variable_exp_name") != null) {
            this.setState({ variable_exp_name: localStorage.getItem("variable_exp_name") });
        }
        if (localStorage.getItem("variable_exp_amount") != null) {
            this.setState({ variable_exp_amount: localStorage.getItem("variable_exp_amount") });
        }
        if (localStorage.getItem("starting_balance") != null) {
            this.setState({ starting_balance: localStorage.getItem("starting_balance") });
        }

        Auth.currentAuthenticatedUser().then(user => {
            let email = user.attributes.email;

            API.graphql(graphqlOperation(listTransactions, {
                limit: TXN_LIMIT,
                filter: {
                    user: { eq: email },
                    is_recurring: { eq: true }
                }
            })).then(data => {

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

                if (this.state.variable_exp_name !== "" && this.state.variable_exp_amount !== "" && this.state.starting_balance !== "") {
                    this.generateTimeline();
                }
            }).catch((err) => {
                window.alert("Encountered error fetching your transactions: \n", err);
            })

        }).catch((err) => {
            window.alert("Encountered error fetching your username: \n", err);
        });

    }

    updateTransaction(event) {
        this.props.history.push('/AddTransaction/' + event.target.id)
    }


    async autoAdd(recurrTxn, currentDay) {
        var cpyTxn = JSON.parse(JSON.stringify(recurrTxn));

        try {
            cpyTxn.title = "[AUTO ADD]: " + cpyTxn.title;
            delete cpyTxn.id;
            delete cpyTxn.createdAt;
            cpyTxn.is_recurring = false;
            var d = convertDateStrToGraphqlDate(currentDay.getFullYear() + "-" + getDoubleDigitFormat(currentDay.getUTCMonth() + 1) + "-" + getDoubleDigitFormat(currentDay.getUTCDate()));
            cpyTxn.date = d;
            console.log(cpyTxn);
            const res = API.graphql(graphqlOperation(createTransaction, { input: cpyTxn }));

            window.alert("Successfully AUTO added your transaction: " + cpyTxn.title);
        } catch (err) {
            window.alert("ERROR: ", { err });
        }
    }

    generateTimeline() {
        if (this.state.variable_exp_name === "") {
            if (localStorage.getItem("variable_exp_name") != null) {
                this.state.variable_exp_name = localStorage.getItem("variable_exp_name");
            } else {
                window.alert("Must input value for variable spending, name, value and initial balance.");
                return;
            }
        } else {
            if (localStorage.getItem("variable_exp_name") == null || (localStorage.getItem("variable_exp_name") != null && localStorage.getItem("variable_exp_name") != this.state.variable_exp_name)) {
                localStorage.setItem("variable_exp_name", this.state.variable_exp_name);
            }
        }

        if (this.state.variable_exp_amount == "") {
            if (localStorage.getItem("variable_exp_amount") != null) {
                this.state.variable_exp_amount = localStorage.getItem("variable_exp_amount");
            } else {
                window.alert("Must input value for variable spending, name, value and initial balance.");
                return;
            }
        } else {
            if (localStorage.getItem("variable_exp_amount") == null || (localStorage.getItem("variable_exp_amount") != null && localStorage.getItem("variable_exp_amount") != this.state.variable_exp_amount)) {
                localStorage.setItem("variable_exp_amount", this.state.variable_exp_amount);
            }
        }

        if (this.state.starting_balance == "") {
            if (localStorage.getItem("starting_balance") != null) {
                this.state.starting_balance = localStorage.getItem("starting_balance");
            } else {
                window.alert("Must input value for variable spending, name, value and initial balance.");
                return;
            }
        } else {
            if (localStorage.getItem("starting_balance") == null || (localStorage.getItem("starting_balance") != null && localStorage.getItem("starting_balance") != this.state.starting_balance)) {
                localStorage.setItem("starting_balance", this.state.starting_balance);
            }
        }

        var balanceRows = [];
        const DAY_TO_CALCULATE = 31 * 6;

        var start = new Date();
        // start.setDate(start.getDate() - 1);
        var end = new Date();
        end.setDate(start.getDate() + DAY_TO_CALCULATE);

        var currentDay = new Date(start);
        var idx = 0;
        while (currentDay < end) {

            balanceRows[idx] = {
                id: idx,
                balanceDate: new Date(currentDay),
                balance: (idx === 0) ? this.state.starting_balance : balanceRows[idx - 1].balance,
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

                    if (idx === 0) {
                        // if I have a value stored in storage
                        if (localStorage.getItem("last_auto_add_date") != null) {
                            const lastAutoAddDt = localStorage.getItem("last_auto_add_date");
                            var y = lastAutoAddDt.split('-')[0];
                            var m = lastAutoAddDt.split('-')[1];
                            var d = lastAutoAddDt.split('-')[2];

                            // curr day
                            var yc = currentDay.getFullYear();
                            var mc = getDoubleDigitFormat(currentDay.getUTCMonth() + 1);
                            var dc = getDoubleDigitFormat(currentDay.getUTCDate());
                            if (y != yc || m != mc || d != dc) {
                                console.log("DIFF DATES ADDING");
                                console.log(yc + "-" + mc + "-" + dc);
                                console.log(y + "-" + m + "-" + d);
                                // if the saved date is different than the current date, then we upate our storage and auto add
                                localStorage.setItem("last_auto_add_date", yc + "-" + mc + "-" + dc);
                                this.autoAdd(recurrTxn, currentDay);
                            }
                        } else {
                            var yc = currentDay.getFullYear();
                            var mc = getDoubleDigitFormat(currentDay.getUTCMonth() + 1);
                            var dc = getDoubleDigitFormat(currentDay.getUTCDate());
                            localStorage.setItem("last_auto_add_date", yc + "-" + mc + "-" + dc);
                            this.autoAdd(recurrTxn, currentDay);
                        }
                    }
                }
            }

            // if first day of month... add variable spending
            if (currentDay.getDate() === 1) {
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

                // update income
                var incomeStr = ""
                var incomeDescStr = ""
                var incomeLinks = [];
                for (var incomeTxn of recurringIncomes) {
                    incomeStr += ("$" + incomeTxn.amount.toString() + ", ");
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
                    expenseStr += ("$" + expenseTxn.amount.toString() + ", ");
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
        this.setState({
            [name]: value
        });
    }

    getGraphPoints() {
        // https://www.npmjs.com/package/react-linechart
        var dp = [];
        var time = 1;
        for (var balanceRow of this.state.balance_rows) {
            dp.push({ x: time, y: balanceRow.balance });
            time += 1;
        }

        const data = [
            {
                color: "steelblue",
                points: dp
            }
        ];

        return data;
    }

    render() {

        return (

            <div>
   
                <div class="filtersInput" >
   
                <LineChart 
                            margins={{ top: 0, right: 0, bottom: 0, left: 65 }}
                            hidePoints={true}
                            yMin={0}
                            width={400}
                            height={200}
                            hideXLabel={true}
                            hideXAxis={true}
                            yLabel={"Balance"}
                            data={this.getGraphPoints()}
                        />
                        
                        <b>Variable Spending Name:</b><br />
                        <input
                        
                            className="roundedOutline"
                            name="variable_exp_name"
                            type="text"
                            placeholder="variable expense name"
                            value={this.state.variable_exp_name}
                            onChange={this.handleChange} /><br />

                        <b>Amount:</b><br />
                        <input
                            className="roundedOutline"
                            name="variable_exp_amount"
                            placeholder="variable expense amount"
                            type="text"
                            value={this.state.variable_exp_amount}
                            onChange={this.handleChange} /><br />
          

                        <b>Starting Balance:</b><br />
                        <input
                        
                            className="roundedOutline"
                            name="starting_balance"
                            placeholder="starting balance"
                            type="text"
                            value={this.state.starting_balance}
                            onChange={this.handleChange} /><br />
                    
                    <button class="filterTimeline" onClick={this.generateTimeline}><b>generate timeline</b></button>
                </div>


                <div>
                    <table id='transactions' align="center" style={{ height: '90%', width: '95%' }}>
                        <h4><b>Timeline</b></h4>
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

export default TimeTravel;
