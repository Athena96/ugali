// React
import React, { Component, PureComponent } from 'react';
import { Slider } from 'material-ui-slider';

import {
    LineChart,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Line,
    ResponsiveContainer
} from "recharts";

// Amplify
import API, { graphqlOperation } from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from '../aws-exports';
import { Auth } from 'aws-amplify';


// Data Mutation
import { deleteTransactionWithId } from '../dataMutation/TransactionMutation';

// Data Access
import { fetchRecurringTransactions } from '../dataAccess/TransactionAccess';
import { checkIfPremiumUser } from '../dataAccess/PremiumUserAccess';

// Common
import { getDoubleDigitFormat } from '../common/Utilities';
import { Frequencies, getLastDayOfMonthFromDate, getDisplayTransactions } from '../common/Utilities';

API.configure(awsconfig);
PubSub.configure(awsconfig);

const MONTHS_TO_CALCULATE = 6;

class CustomizedAxisTick extends PureComponent {
    render() {
        const {
            x, y, payload,
        } = this.props;

        return (
            <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">{payload.value}</text>
            </g>
        );
    }
}
var REALTIME_SLIDER_VAL = 0;

class TimeTravel extends Component {
    constructor(props) {
        super(props);
        this.shownRecorded = {};
        this.state = {
            balance_rows: [],
            variable_exp_name: "Variably Monthly Spending (Credit Card)",
            variable_exp_amount: "0.0",
            recurring_txns: [],
            user: "",
            isPremiumUser: false,
            subscriptionExpired: true,
            premiumUsers: {},
            IS_LOADING: true,
            variableSpending: 0
        };

        this.after = this.after.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.generateTimeline = this.generateTimeline.bind(this);
        this.deleteTransactionButton = this.deleteTransactionButton.bind(this);
        this.updateTransaction = this.updateTransaction.bind(this);
        this.duplicateTransaction = this.duplicateTransaction.bind(this);
        this.renderRecurringTransactions = this.renderRecurringTransactions.bind(this);

    }

    // operations
    deleteTransactionButton(event) {
        const txnId = event.target.id;
        deleteTransactionWithId(txnId)
            .then((response) => {
                window.alert("Successfully deleted your transaction!");
                var newTxns = [];
                for (var txn of this.state.recurring_txns) {
                    if (txn.id !== txnId) {
                        newTxns.push(txn);
                    }
                }

                this.setState({
                    recurring_txns: newTxns,
                });
            })
            .catch(function (response) {
                console.log(response);
                window.alert(response);
            });
    }

    updateTransaction(event) {

        console.log("UPDATE")
        this.props.history.push('/addTransaction/update/' + event.target.id)
    }

    duplicateTransaction(event) {
        this.props.history.push('/addTransaction/duplicate/' + event.target.id)
    }

    // helper
    getGraphPoints() {
        // https://recharts.org/en-US/api
        var dp = [];
        var time = 1;
        for (var balanceRow of this.state.balance_rows) {
            var d = new Date(balanceRow.balanceDate);
            var dt = "" + d.getFullYear() + "-" + getDoubleDigitFormat(d.getMonth() + 1) + "-" + getDoubleDigitFormat(d.getDate() + 1);
            const bal = parseFloat(parseFloat(balanceRow.balance).toFixed(2));
            const fitLine = (this.state.m * time) + this.state.b;
            const pt = { "name": dt, "amt": time, "balance": bal, "balance_avg": this.state.balance_avg, "fit_line": fitLine };
            dp.push(pt);
            time += 1;
        }
        return dp;
    }

    generateTimeline() {
        var sum = 0.0;
        var xSum = 0.0;
        var ySum = 0.0;

        this.shownRecorded = {};
        var balanceRows = [];
        var start = new Date();
        var end = new Date();
        end.setDate(start.getDate() + (MONTHS_TO_CALCULATE * 31));

        var currentDay = new Date(start);
        var idx = 0;
        while (currentDay < end) {

            // create entry for the current day's balance row
            const bal = (idx === 0) ? 0 : balanceRows[idx - 1].balance;
            balanceRows[idx] = {
                id: idx,
                balanceDate: new Date(currentDay),
                balance: bal,
                income: "",
                incomeDesc: "",
                expense: "",
                expenseDesc: ""
            }
            sum += bal;
            ySum += bal;
            xSum += idx;

            // get any recurring transactions for current day of while loop.
            var recurringIncomes = [];
            var recurringExpenses = [];
            for (var recurrTxn of this.state.recurring_txns) {

                // get the day and month of the recurring transaction.
                var recurrTxnDay = parseInt(recurrTxn.date.split('-')[2].split('T')[0]);
                var recurrTxnMonth = parseInt(recurrTxn.date.split('-')[1]);
                var recurrTxnYear = parseInt(recurrTxn.date.split('-')[0]);

                // add the recurring txn to our list
                if (Frequencies.ONCE === recurrTxn.recurring_frequency) {
                    if (recurrTxnDay === currentDay.getDate()) {
                        // if we haven't accounted for the 1x recurring txn yet, then add it
                        if (this.shownRecorded[recurrTxn.title] === undefined) {
                            // month has to match for a 1x recurring txn
                            if (recurrTxnMonth === (currentDay.getMonth() + 1)) {
                                (recurrTxn.type === 2) ? recurringExpenses.push(recurrTxn) : recurringIncomes.push(recurrTxn);
                                // update the ONCE 'shown' map.
                                this.shownRecorded[recurrTxn.title] = true;
                            }
                        }
                    }
                } else if (Frequencies.MONTHLY === recurrTxn.recurring_frequency) {
                    if (recurrTxnDay === currentDay.getDate()) {

                        (recurrTxn.type === 2) ? recurringExpenses.push(recurrTxn) : recurringIncomes.push(recurrTxn);
                    }
                } else if (Frequencies.YEARLY === recurrTxn.recurring_frequency) {
                    if (recurrTxnDay === currentDay.getDate()) {

                        // day same, month same, year diff
                        if (recurrTxnMonth === (currentDay.getMonth() + 1) && recurrTxnYear !== currentDay.getFullYear()) {
                            (recurrTxn.type === 2) ? recurringExpenses.push(recurrTxn) : recurringIncomes.push(recurrTxn);
                        }
                    }
                } else if (Frequencies.WEEKLY === recurrTxn.recurring_frequency) {
                    var dtObj = new Date(recurrTxn.date);
                    if (dtObj.getDay() === currentDay.getDay()) {
                        (recurrTxn.type === 2) ? recurringExpenses.push(recurrTxn) : recurringIncomes.push(recurrTxn);
                    }
                } else if (Frequencies.BIWEEKLY === recurrTxn.recurring_frequency) {
                    function datediff(first, second) {
                        return Math.round((second - first) / (1000 * 60 * 60 * 24));
                    }
                    var dtObjBiWeek = new Date(recurrTxn.date);
                    if (dtObjBiWeek.getDay() === currentDay.getDay() && (datediff(dtObjBiWeek, currentDay) % 14 === 0)) {
                        (recurrTxn.type === 2) ? recurringExpenses.push(recurrTxn) : recurringIncomes.push(recurrTxn);
                    }
                } else if (Frequencies.FIRST_DAY_OF_MONTH === recurrTxn.recurring_frequency) {
                    if (currentDay.getDate() === 1) {
                        (recurrTxn.type === 2) ? recurringExpenses.push(recurrTxn) : recurringIncomes.push(recurrTxn);
                    }
                } else if (Frequencies.LAST_DAY_OF_MONTH === recurrTxn.recurring_frequency) {
                    const lastDayOfCurrentMonth = getLastDayOfMonthFromDate(currentDay);
                    if (currentDay.getDate() === lastDayOfCurrentMonth) {
                        (recurrTxn.type === 2) ? recurringExpenses.push(recurrTxn) : recurringIncomes.push(recurrTxn);
                    }
                }
            }

            // if first day of month... add variable spending
            if (currentDay.getDate() === 1) {
                const varSpendingTxn = {
                    title: this.state.variable_exp_name,
                    amount: parseFloat(this.state.variable_exp_amount),
                    is_recurring: "true",
                    type: 2
                }
                recurringExpenses.push(varSpendingTxn);
            }

            // update the balance row object with our recurring txns that we found for today.
            if (recurringIncomes.length !== 0 || recurringExpenses.length !== 0) {
                // update balance
                var totalIncome = recurringIncomes.map(item => item.amount).reduce((prev, next) => prev + next, 0.0);
                var totalExpense = recurringExpenses.map(item => item.amount).reduce((prev, next) => prev + next, 0.0);
                balanceRows[idx].balance = parseFloat(balanceRows[idx].balance);
                balanceRows[idx].balance += totalIncome;
                balanceRows[idx].balance -= totalExpense;

                // update income
                var incomeStr = ""
                var incomeDescStr = ""
                var incomeLinks = [];
                var incomeDescriptions = [];
                for (var incomeTxn of recurringIncomes) {
                    incomeStr += ("$" + incomeTxn.amount.toString() + ", ");
                    incomeDescStr += (incomeTxn.title + ", ");
                    incomeLinks.push(incomeTxn.id);
                    incomeDescriptions.push(incomeTxn.title);
                }
                balanceRows[idx].income = incomeStr;
                balanceRows[idx].incomeDesc = incomeDescStr;
                balanceRows[idx].incomeLinks = incomeLinks;
                balanceRows[idx].incomeDescriptions = incomeDescriptions;

                // update expense
                var expenseStr = "";
                var expenseDescStr = "";
                var expenseLinks = [];
                var expenseDescriptions = [];
                for (var expenseTxn of recurringExpenses) {
                    expenseStr += ("$" + expenseTxn.amount.toString() + ", ");
                    expenseDescStr += (expenseTxn.title + ", ");
                    expenseLinks.push(expenseTxn.id);
                    expenseDescriptions.push(expenseTxn.title);
                }
                balanceRows[idx].expense = expenseStr;
                balanceRows[idx].expenseDesc = expenseDescStr;
                balanceRows[idx].expenseLinks = expenseLinks;
                balanceRows[idx].expenseDescriptions = expenseDescriptions;
            }

            // update currentDay and idx for the while loop
            var newDate = currentDay.setDate(currentDay.getDate() + 1);
            currentDay = new Date(newDate);
            idx += 1;
        }

        const avg = parseInt((sum / idx));
        const xAvg = parseInt((xSum / idx));
        const YAvg = parseInt((ySum / idx));

        // num denom
        var num = 0;
        var denom = 0;
        for (var i = 0; i < balanceRows.length; i += 1) {
            num += ((balanceRows[i].balance - YAvg) * (i - xAvg));
            denom += ((i - xAvg) * (i - xAvg));
        }
        const m = parseInt(num / denom);
        const b = YAvg - (m * xAvg);

        this.setState({
            balance_rows: balanceRows,
            balance_avg: avg,
            m: m,
            b: b
        });

    }

    // life cycle
    componentDidMount() {
        this.setState({ IS_LOADING: true });
        checkIfPremiumUser()
            .then((response) => {
                this.setState({ isPremiumUser: response.isPremiumUser });
                this.setState({ subscriptionExpired: response.subscriptionExpired });
                if (!response.isPremiumUser || response.subscriptionExpired) {
                    this.props.history.push('/premium/');
                }
                this.setState({ IS_LOADING: false });
            })
            .catch(function (response) {
                console.log(response);
            });

        fetchRecurringTransactions(this.state.year, this.state.month, this.state.category)
            .then((response) => {
                this.setState({ recurring_txns: response.recurring_txns })
                this.generateTimeline();
            })
            .catch(function (response) {
                // Handle error
                console.log(response);
            });
    }

    handleChange(event) {
        if (typeof event === "number") {
            REALTIME_SLIDER_VAL = event;
            return;
        }

        var target = event.target;
        var value = target.value;
        var name = target.name;
        this.setState({
            [name]: value
        });
    }



    after() {
        this.setState({
            variableSpending: REALTIME_SLIDER_VAL,
            variable_exp_amount: REALTIME_SLIDER_VAL.toString()
        }, () => {
            this.generateTimeline()
        });
    }

    renderPremiumUserPage() {

        const data = this.getGraphPoints();

        return (
            <div>
                <div class="inset" >
                    <ResponsiveContainer height={400} width='100%'>
                        <LineChart
                            data={data}
                            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" height={60} tick={<CustomizedAxisTick />} />


                            <Tooltip />
                            <Legend />

                            <Line type="monotone" dataKey="balance" stroke="#ff7b7b" dot={false} />
                            <Line type="monotone" dataKey="balance_avg" stroke="#fcba03" dot={false} />
                            <Line type="monotone" dataKey="fit_line" stroke="#82ca9d" dot={false} />

                        </LineChart></ResponsiveContainer>
                </div>
                <div class="inset" >
                    <div className="infoBox">
                        <h4><b>Monthly Variable Spending:</b> ${this.state.variable_exp_amount}</h4>
                    </div>
                </div>

                <div class="inset" >
                    <Slider
                        defaultValue={0}
                        min={0}
                        max={1500}
                        color={"#ff7b7b"}
                        onChangeComplete={this.after}
                        onChange={this.handleChange}
                        value={this.state.variableSpending}
                    />

                </div>

                <div class="inset" >
                    <h4><b>Recurring Transactions</b></h4>
                    {this.renderRecurringTransactions()}
                </div>

            </div>
        );
    }

    renderRecurringTransactions() {

        if (this.state.recurring_txns.length !== 0) {

            return (
                 getDisplayTransactions(this.state.recurring_txns, this.state.isPremiumUser, this.deleteTransactionButton, this.updateTransaction, this.duplicateTransaction) 
            );

        } else {
            return (<div class="indent">
                <h5>You need to have Recurring Transactions to use the TimeTravel feature, and you haven't added any yet.</h5>
                <h5>Select <b>'Add Transaction'</b> from the menu to add some!</h5>
            </div>)
        }

    }

    render() {
        if (this.state.IS_LOADING) {
            return (
                <div class="indent">
                    <h4>Loading...</h4>
                </div>
            );
        } else {
            return (
                this.renderPremiumUserPage()
            );
        }
    }
}

export default TimeTravel;
