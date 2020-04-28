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

// GraphQl Mutations
import { createTransaction } from '../graphql/mutations';
import { createPremiumUsers } from '../graphql/mutations';
import { updatePremiumUsers } from '../graphql/mutations';

// Data Access
import { fetchRecurringTransactions } from '../dataAccess/TransactionAccess';
import { checkIfPremiumUser } from '../dataAccess/PremiumUserAccess';

// Common
import { getDoubleDigitFormat, convertDateStrToGraphqlDate, graphqlDateFromJSDate } from '../common/Utilities';
import { Frequencies } from '../common/Utilities';

API.configure(awsconfig);
PubSub.configure(awsconfig);

const MONTHS_TO_CALCULATE = 6;

class TimeTravel extends Component {
    constructor(props) {
        super(props);
        this.shownRecorded = {};
        this.state = {
            balance_rows: [],
            variable_exp_name: "Variably Monthly Spending (Credit Card)",
            variable_exp_amount: "0.0",
            recurring_txns: [],
            starting_balance: "0.0",
            user: "",
            isPremiumUser: false,
            subscriptionExpired: true,
            premiumUsers: {},
            IS_LOADING: true
        };
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
            cpyTxn.recurring_period = "NA";
            var d = convertDateStrToGraphqlDate(currentDay.getFullYear() + "-" + getDoubleDigitFormat(currentDay.getUTCMonth() + 1) + "-" + getDoubleDigitFormat(currentDay.getUTCDate()));
            cpyTxn.date = d;
            cpyTxn.createdAt = d;

            API.graphql(graphqlOperation(createTransaction, { input: cpyTxn }));
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

    checkTimelineInputFields() {
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
    }
    generateTimeline() {
        this.checkTimelineInputFields();

        this.shownRecorded = {};
        var balanceRows = [];
        var start = new Date();
        var end = new Date();
        end.setDate(start.getDate() + (MONTHS_TO_CALCULATE * 31));

        var currentDay = new Date(start);
        var idx = 0;
        while (currentDay < end) {

            // create entry for the current day's balance row
            balanceRows[idx] = {
                id: idx,
                balanceDate: new Date(currentDay),
                balance: (idx === 0) ? this.state.starting_balance : balanceRows[idx - 1].balance,
                income: "",
                incomeDesc: "",
                expense: "",
                expenseDesc: ""
            }

            // check if user has already had their transactions auto added
            var numRecurrTxnsToAutoAdd = this.state.recurring_txns.length;
            if (localStorage.getItem("last_auto_add_date") != null) {
                // last auto add day.
                const lastAutoAddDt = localStorage.getItem("last_auto_add_date");
                var y = lastAutoAddDt.split('-')[0];
                var m = lastAutoAddDt.split('-')[1];
                var d = lastAutoAddDt.split('-')[2];

                // curr day
                var yc = currentDay.getFullYear();
                var mc = getDoubleDigitFormat(currentDay.getUTCMonth() + 1);
                var dc = getDoubleDigitFormat(currentDay.getUTCDate());

                // if we've already auto added today, then there are no more
                //  recurring transactions to auto add.
                if ((y == yc || m == mc || d == dc)) {
                    numRecurrTxnsToAutoAdd = 0;
                }
            }

            // get any recurring transactions for current day of while loop.
            var recurringIncomes = [];
            var recurringExpenses = [];
            for (var recurrTxn of this.state.recurring_txns) {

                // get the day and month of the recurring transaction.
                var recurrTxnDay = parseInt(recurrTxn.date.split('-')[2].split('T')[0]);
                var recurrTxnMonth = parseInt(recurrTxn.date.split('-')[1]);
                var recurrTxnYear = parseInt(recurrTxn.date.split('-')[0]);

                // if the recurring txn happens today.
                if (recurrTxnDay === currentDay.getDate()) {

                    // add the recurring txn to our list
                    if (Frequencies.ONCE === recurrTxn.recurring_frequency) {
                        // if we haven't accounted for the 1x recurring txn yet, then add it
                        if (this.shownRecorded[recurrTxn.title] === undefined) {
                            // month has to match for a 1x recurring txn
                            if (recurrTxnMonth === (currentDay.getMonth() + 1)) {
                                (recurrTxn.type === 2) ? recurringExpenses.push(recurrTxn) : recurringIncomes.push(recurrTxn);
                                // update the ONCE 'shown' map.
                                this.shownRecorded[recurrTxn.title] = true;
                            }
                        }
                    } else if (Frequencies.MONTHLY === recurrTxn.recurring_frequency) {
                        (recurrTxn.type === 2) ? recurringExpenses.push(recurrTxn) : recurringIncomes.push(recurrTxn);
                    } else if (Frequencies.YEARLY === recurrTxn.recurring_frequency) {
                        // day same, month same, year diff
                        if (recurrTxnMonth === (currentDay.getMonth() + 1)) {
                            (recurrTxn.type === 2) ? recurringExpenses.push(recurrTxn) : recurringIncomes.push(recurrTxn);
                        }
                    }

                    /* if the recurring txn occoures on the real current day (not current day of the while loop)
                        then AUTO ADD it */
                    if (idx === 0) {
                        // if I have a value stored in storage, and I still need to auto add
                        if (localStorage.getItem("last_auto_add_date") != null && numRecurrTxnsToAutoAdd !== 0) {
                            // date of last auto add
                            const lastAutoAddDt = localStorage.getItem("last_auto_add_date");
                            var y = lastAutoAddDt.split('-')[0];
                            var m = lastAutoAddDt.split('-')[1];
                            var d = lastAutoAddDt.split('-')[2];

                            // curr day
                            var yc = currentDay.getFullYear();
                            var mc = getDoubleDigitFormat(currentDay.getUTCMonth() + 1);
                            var dc = getDoubleDigitFormat(currentDay.getUTCDate());

                            // if the last auto add day is diff, update it to be today, since we're auto adding now.
                            // then go ahead and auto add, and decriment the auto add counter.
                            if (y != yc || m != mc || d != dc) {
                                localStorage.setItem("last_auto_add_date", yc + "-" + mc + "-" + dc);
                                this.autoAdd(recurrTxn, currentDay);
                                numRecurrTxnsToAutoAdd -= 1;
                            } else if ((y == yc || m == mc || d == dc) && numRecurrTxnsToAutoAdd !== 0) {
                                this.autoAdd(recurrTxn, currentDay);
                                numRecurrTxnsToAutoAdd -= 1;
                            }
                        } else if (numRecurrTxnsToAutoAdd !== 0) {
                            // don't have value in storage, but need to auto add, then 
                            //  update the local storage... and auto add the txn.
                            var yc = currentDay.getFullYear();
                            var mc = getDoubleDigitFormat(currentDay.getUTCMonth() + 1);
                            var dc = getDoubleDigitFormat(currentDay.getUTCDate());
                            localStorage.setItem("last_auto_add_date", yc + "-" + mc + "-" + dc);
                            this.autoAdd(recurrTxn, currentDay);
                            numRecurrTxnsToAutoAdd -= 1;
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

            // update the balance row object with our recurring txns that we found for today.
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

            // update currentDay and idx for the while loop
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
        let currentComponent = this;
        this.setState({ IS_LOADING: true });
        checkIfPremiumUser()
            .then(function (response) {
                currentComponent.setState({ isPremiumUser: response.isPremiumUser })
                currentComponent.setState({ subscriptionExpired: response.subscriptionExpired })
                currentComponent.setState({ premiumUser: response.premiumUser })
                currentComponent.setState({ IS_LOADING: false });
            })
            .catch(function (response) {
                console.log(response);
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

    renderPremiumUserPage() {
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

                    <div align="center">
                        <LineChart
                            margins={{ top: 0, right: 0, bottom: 0, left: 0 }}
                            hidePoints={true}
                            isDate={true}
                            yMin={0}
                            width={450}
                            height={200}
                            hideXLabel={false}
                            yLabel={"Balance"}
                            xLabel={"Time"}

                            data={this.getGraphPoints()}
                        />
                    </div>
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
    }

    renderBuyPage() {
        return (
            <div className="indent">
                <div align="center">
                    <div>
                        <h4><b>ZenSpending</b> Premium</h4>
                    </div>
                    <div className="premiumFeatureBackground">
                        <h4>Upgrade Now</h4>
                        <h5>$15.99 for 1 year</h5>
                        <PayPalButton
                            amount="15.99"
                            align="center"
                            shippingPreference="NO_SHIPPING"
                            style={{ color: "black", align: "center;" }}
                            onSuccess={(details, data) => {

                                Auth.currentAuthenticatedUser().then(user => {
                                    let email = user.attributes.email;
                                    this.setState({ user: email });

                                    // add user or update subscription?
                                    if (this.state.isPremiumUser && this.state.subscriptionExpired) {
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
                    <div align="left">
                        <h5>Features</h5>
                        <ul>
                            <li><h6>Make your transactions <b>recurring</b> so that they get created <b>automatically</b> every month. (bills, subscriptions, paycheck, ...)</h6></li>
                            <li><h6><b>"Time Travel"</b> to see what you future liquidity will be based on your current account balance, recurring transactions, and estimated variable spending (credit card spending).</h6></li>
                        </ul>
                    </div>
                    <div align="left">
                        <h5>Terms and Conditions</h5>
                        <ul>
                            <li><h6>After 1 year, you will <b>not</b> be auto re-subscribed.</h6></li>
                            <li><h6>You can cancel your membership anytime, within the first month, and receive a full refund. Just email <b>zenspending.@gmail.com</b> asking for a refund.</h6></li>
                        </ul>
                    </div>

                </div>
            </div>
        );
    }

    render() {
        if (this.state.IS_LOADING) {
            return (
                <div class="indent">
                    <h4>Loading...</h4>
                </div>
            );
        } else if (!this.state.IS_LOADING && (this.state.isPremiumUser && !this.state.subscriptionExpired)) {
            return (
                this.renderPremiumUserPage()
            );

        } else if (!this.state.IS_LOADING && (!this.state.isPremiumUser || this.state.subscriptionExpired)) {
            return (
                this.renderBuyPage()
            );
        }
    }
}

export default TimeTravel;
