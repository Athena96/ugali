// React
import React, { Component } from 'react';

import LineChart from 'react-linechart';
import '../../node_modules/react-linechart/dist/styles.css';

// Amplify
import API, { graphqlOperation } from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from '../aws-exports';
import { Auth } from 'aws-amplify';

// PayPal
import { PayPalButton } from "react-paypal-button-v2";

// graphql
import { createTransaction } from '../graphql/mutations';
import { createPremiumUsers } from '../graphql/mutations';
import { listPremiumUserss } from '../graphql/queries';
import { updatePremiumUsers } from '../graphql/mutations';

import { fetchRecurringTransactions } from '../dataAccess/TransactionAccess';

import { getDoubleDigitFormat, convertDateStrToGraphqlDate, graphqlDateFromJSDate } from '../common/Utilities';

API.configure(awsconfig);
PubSub.configure(awsconfig);

// Constants
const TXN_LIMIT = 200;
const PREMIUM_USER_LIMIT = 200;

class TimeTravel extends Component {
    constructor(props) {
        super(props);
        this.shownRecorded = {};
        this.state = { balance_rows: [], variable_exp_name: "Variably Monthly Spending (Credit Card)", variable_exp_amount: "0.0", recurring_txns: [], starting_balance: "0.0", user: "", isPremiumUser: false, subscriptionExpired: true, premiumUsers: {} };
        this.handleChange = this.handleChange.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.generateTimeline = this.generateTimeline.bind(this);
    }

    // operation
    async autoAdd(recurrTxn, currentDay) {
        var cpyTxn = JSON.parse(JSON.stringify(recurrTxn));

        try {
            cpyTxn.title = "[AUTO ADD]: " + cpyTxn.title;
            delete cpyTxn.id;
            delete cpyTxn.createdAt;
            cpyTxn.is_recurring = "false";
            cpyTxn.is_recurring_period = false;
            var d = convertDateStrToGraphqlDate(currentDay.getFullYear() + "-" + getDoubleDigitFormat(currentDay.getUTCMonth() + 1) + "-" + getDoubleDigitFormat(currentDay.getUTCDate()));
            cpyTxn.date = d;
            const res = API.graphql(graphqlOperation(createTransaction, { input: cpyTxn }));

            window.alert("Successfully AUTO added your transaction: " + cpyTxn.title);
        } catch (err) {
            window.alert("Encountered error AUTO adding your transaction.");
        }
    }

    async addNewPremiumUser(premiumUser) {
        // submit
        try {
            const res = await API.graphql(graphqlOperation(createPremiumUsers, { input: premiumUser }));
        } catch (err) {
            console.log(err);
            window.alert("Encountered error adding you to our premium user list.\nEmail: zenspending@gmail for support.");
        }
    }

    async updatePremiumUser(premiumUser) {
        // submit
        try {
            const res = await API.graphql(graphqlOperation(updatePremiumUsers, { input: premiumUser }));
        } catch (err) {
            console.log(err);
            window.alert("Encountered error updating your premium user subscription.\nEmail: zenspending@gmail for support.");
        }
    }

    // helper
    getGraphPoints() {
        // https://www.npmjs.com/package/react-linechart
        var dp = [];
        var time = 1;
        for (var balanceRow of this.state.balance_rows) {
            var d = new Date(balanceRow.balanceDate);
            var dt = "" + d.getFullYear() + "-" + getDoubleDigitFormat(d.getMonth() + 1) + "-" + getDoubleDigitFormat(d.getDate() + 1);
            const pt = { x: dt, y: balanceRow.balance };
            dp.push(pt);
            time += 1;
        }
        const data = [
            {
                color: "#FF7C7B",
                points: dp
            }
        ];
        return data;
    }

    generateTimeline() {
        this.shownRecorded = {}
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
            var numRecurrTxns = this.state.recurring_txns.length;
            for (var recurrTxn of this.state.recurring_txns) {
                var recurrTxnDay = parseInt(recurrTxn.date.split('-')[2].split('T')[0]);
                var recurrTxnMonth = parseInt(recurrTxn.date.split('-')[1]);

                if (recurrTxnDay === currentDay.getDate()) {
                    if (recurrTxn.is_recurring_period === false) {
                        if (this.shownRecorded[recurrTxn.title] === undefined) {
                            if (recurrTxnMonth === (currentDay.getMonth() + 1)) {
                                if (recurrTxn.type === 2) {
                                    recurringExpenses.push(recurrTxn);
                                } else {
                                    recurringIncomes.push(recurrTxn)
                                }
                                this.shownRecorded[recurrTxn.title] = true;
                            }
                        }
                    } else {
                        if (recurrTxn.type === 2) {
                            recurringExpenses.push(recurrTxn);
                        } else {
                            recurringIncomes.push(recurrTxn)
                        }
                    }

                    // AUTO ADD
                    if (idx === 0) {
                        // if I have a value stored in storage
                        if (localStorage.getItem("last_auto_add_date") != null && numRecurrTxns !== 0) {
                            const lastAutoAddDt = localStorage.getItem("last_auto_add_date");
                            var y = lastAutoAddDt.split('-')[0];
                            var m = lastAutoAddDt.split('-')[1];
                            var d = lastAutoAddDt.split('-')[2];

                            // curr day
                            var yc = currentDay.getFullYear();
                            var mc = getDoubleDigitFormat(currentDay.getUTCMonth() + 1);
                            var dc = getDoubleDigitFormat(currentDay.getUTCDate());
                            if (y != yc || m != mc || d != dc) {
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
                            numRecurrTxns -= 1;
                        }
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

            if (recurringIncomes.length != 0 || recurringExpenses.length != 0) {
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

    // render / ui
    renderTableHeader() {
        let header = ['date', 'balance', 'income-expense'];
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
            var balColor = (balance <= 0.0) ? "red" : "black";

            if (incomeDesc !== "" && expenseDesc === "") {
                return (
                    <tr key={id}>
                        {weekDay}
                        <td><font color={balColor}>${parseFloat(balance).toFixed(2)}</font></td>
                        <td><font color="green">+{income}</font> ({incomeDesc})</td>
                    </tr>
                )
            } else if (incomeDesc === "" && expenseDesc !== "") {
                return (
                    <tr key={id}>
                        {weekDay}
                        <td><font color={balColor}>${parseFloat(balance).toFixed(2)}</font></td>
                        <td><font color="red">-{expense}</font> ({expenseDesc})</td>
                    </tr>
                )
            } else if (incomeDesc !== "" && expenseDesc !== "") {
                return (
                    <tr key={id}>
                        {weekDay}
                        <td><font color={balColor}>${parseFloat(balance).toFixed(2)}</font></td>
                        <td><font color="green">+{income}</font> ({incomeDesc}){<br />}<font color="red">-{expense}</font> ({expenseDesc})</td>
                    </tr>
                )
            } else {
                return (
                    <tr key={id}>
                        {weekDay}
                        <td><font color={balColor}>${parseFloat(balance).toFixed(2)}</font></td>
                        <td></td>
                    </tr>
                )
            }

        })
    }

    // life cycle
    componentDidMount() {
        // get premium users list
        Auth.currentAuthenticatedUser().then(user => {
            let email = user.attributes.email;
            API.graphql(graphqlOperation(listPremiumUserss, {
                limit: PREMIUM_USER_LIMIT,
                filter: {
                    user: { eq: email }
                }
            })).then(data => {
                console.log(email);
                console.log(data);
                const premiumUsers = data.data.listPremiumUserss.items;
                if (premiumUsers.length === 0) {
                    this.setState({ isPremiumUser: false });
                    this.setState({ subscriptionExpired: true });

                } else {
                    this.setState({ premiumUser: premiumUsers[0] });
                    const today = new Date();
                    const expDate = new Date(premiumUsers[0].expiryDate);
                    if (today < expDate) {
                        this.setState({ isPremiumUser: true });
                        this.setState({ subscriptionExpired: false });
                    } else {
                        this.setState({ isPremiumUser: true });
                        this.setState({ subscriptionExpired: true });
                    }
                }
            }).catch((err) => {
                console.log(err);
            })
        }).catch((err) => {
            window.alert("Encountered error fetching your username: \n", err);
        });

        // check local storage for saved values, if have some, populate the fields with it.
        if (localStorage.getItem("variable_exp_amount") != null) {
            this.setState({ variable_exp_amount: localStorage.getItem("variable_exp_amount") });
        }
        if (localStorage.getItem("starting_balance") != null) {
            this.setState({ starting_balance: localStorage.getItem("starting_balance") });
        }

        var currentComp = this;

        fetchRecurringTransactions(this.state.year, this.state.month, this.state.category)
            .then(function (response) {
                console.log(response);
                currentComp.setState({ recurring_txns: response.recurring_txns })

                if (currentComp.variable_exp_name !== "" && currentComp.variable_exp_amount !== "" && currentComp.starting_balance !== "") {
                    currentComp.generateTimeline();
                }

            })
            .catch(function (response) {
                // Handle error
                console.log(response);
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

    render() {
        if (this.state.isPremiumUser && !this.state.subscriptionExpired) {
            return (
                <div>
                    <div class="filtersInput" >
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

                        <LineChart
                            margins={{ top: 0, right: 0, bottom: 0, left: 65 }}
                            hidePoints={true}
                            isDate={true}
                            yMin={0}
                            width={400}
                            height={200}
                            hideXLabel={false}
                            yLabel={"Balance"}
                            xLabel={"Time"}

                            data={this.getGraphPoints()}
                        />
                    </div>
                    <div>
                        <table id='transactions' align="center" style={{ height: '90%', width: '98%' }}>
                            <h4><b>Timeline</b></h4>
                            <tbody>
                                <tr>{this.renderTableHeader()}</tr>
                                {this.renderTableData()}
                            </tbody>
                        </table>
                    </div>
                </div>
            );

        } else {
            return (
                <div className="indent">
                    <h4><b>Time Travel</b> is a premium feature,
                    <br />it costs $ to develop, maintain, and host an app ;)</h4>
                    <h4>Purchase a <b>1 year subscription</b> for <b>$15.01</b></h4>
                    <ul>
                        <li><h5>After a year, you will <b>not</b> be auto re-subscribed.</h5></li>
                        <li><h5>You can cancel your membership anytime, within the first month, and receive a full refund. Just email <b>zenspending.@gmail.com</b> asking for a refund.</h5></li>
                    </ul>
                    <PayPalButton
                        amount="15.01"
                        shippingPreference="NO_SHIPPING"
                        style={{ color: "black" }}
                        onSuccess={(details, data) => {

                            Auth.currentAuthenticatedUser().then(user => {
                                let email = user.attributes.email;
                                this.setState({ user: email });

                                // add user or update subscription?
                                if (this.state.isPremiumUser && this.state.subscriptionExpired) {
                                    // update 
                                    console.log("UPDATE");

                                    // construct premium user
                                    const today = new Date();
                                    var year = today.getFullYear();
                                    var month = today.getMonth();
                                    var day = today.getDate();
                                    var newExpDate = new Date(year + 1, month, day);

                                    const updatedUser = {
                                        id: this.state.premiumUser.id,
                                        user: email,
                                        oderId: data.orderID,
                                        expiryDate: graphqlDateFromJSDate(newExpDate)
                                    }
                                    console.log(updatedUser);
                                    this.setState({ isPremiumUser: true });
                                    this.setState({ subscriptionExpired: false });

                                    // add user to premium user table.
                                    this.updatePremiumUser(updatedUser);
                                    alert("Transaction completed!\nWe here at ZenSpending thank you for renewing your membership!\nRefresh the page to start using Premium Features!");
                                } else if (this.state.isPremiumUser == false) {
                                    // construct premium user
                                    const today = new Date();
                                    var year = today.getFullYear();
                                    var month = today.getMonth();
                                    var day = today.getDate();
                                    var expDate = new Date(year + 1, month, day);

                                    const premiumUser = {
                                        user: email,
                                        oderId: data.orderID,
                                        expiryDate: graphqlDateFromJSDate(expDate)
                                    }
                                    console.log(premiumUser);
                                    this.setState({ isPremiumUser: true });
                                    // add user to premium user table.
                                    this.addNewPremiumUser(premiumUser);
                                    alert("Transaction completed!\nWe here at ZenSpending thank you!\nRefresh the page to start using Premium Features!");
                                }
                            }).catch((err) => {
                                console.log(err);
                            });
                        }}
                        options={{
                            disableFunding: ["credit", "card"],
                            clientId: "AUn2TFaV5cB3lVtq0Q3yOlPTMNaU7kGqN8s1togkHH78v3NUsGPvvBkhxApFkCubpYUk3QhZh8xfGbOX"
                        }}
                    />
                </div>
            );
        }
    }
}

export default TimeTravel;
