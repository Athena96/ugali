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

// PayPal
import { PayPalButton } from "react-paypal-button-v2";

// GraphQl Mutations
import { createPremiumUsers } from '../graphql/mutations';
import { updatePremiumUsers } from '../graphql/mutations';

// Data Mutation
import { deleteTransactionWithId } from '../dataMutation/TransactionMutation';

// Data Access
import { fetchRecurringTransactions } from '../dataAccess/TransactionAccess';
import { checkIfPremiumUser } from '../dataAccess/PremiumUserAccess';

// Common
import { getDoubleDigitFormat, graphqlDateFromJSDate } from '../common/Utilities';
import { Frequencies, getLastDayOfMonthFromDate } from '../common/Utilities';

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
        this.props.history.push('/addTransaction/update/' + event.target.id)
    }

    duplicateTransaction(event) {
        this.props.history.push('/addTransaction/duplicate/' + event.target.id)
    }

    async addNewPremiumUser(premiumUser) {
        // submit
        try {
            await API.graphql(graphqlOperation(createPremiumUsers, { input: premiumUser }));
        } catch (err) {
            console.log(err);
            window.alert("Encountered error adding you to our premium user list.\nEmail: zenspending@gmail for support.");
        }
    }

    async updatePremiumUser(premiumUser) {
        // submit
        try {
            await API.graphql(graphqlOperation(updatePremiumUsers, { input: premiumUser }));
        } catch (err) {
            console.log(err);
            window.alert("Encountered error updating your premium user subscription.\nEmail: zenspending@gmail for support.");
        }
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
            console.log(fitLine);
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

        const avg = parseInt((sum/idx));
        const xAvg = parseInt((xSum/idx));
        const YAvg = parseInt((ySum/idx));

        // num denom
        var num = 0;
        var denom = 0;
        for (var i = 0; i < balanceRows.length; i += 1) {
            num += ((balanceRows[i].balance - YAvg)*(i - xAvg));
            denom += ((i - xAvg)*(i - xAvg));
        }
        const m = parseInt(num/denom);
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
                this.setState({ isPremiumUser: response.isPremiumUser })
                this.setState({ subscriptionExpired: response.subscriptionExpired })
                this.setState({ premiumUser: response.premiumUser })
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
        var txnsArr = [];
        var displayDate;
        var currDay = ""
        for (var transaction of this.state.recurring_txns) {
            const { id, title, amount, category, date, recurring_frequency, type, payment_method, description, is_recurring } = transaction;
            var classname = (type === 1) ? "incomeRecurrTxn" : "expenseRecurrTxn";
            const dayIdx = new Date(date);
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            var dayOfWeek = days[dayIdx.getDay()];
            var desc = <div className="desc"><p><b>Description:</b><br />{description}</p></div>;
            var yesmessage = "yes (" + recurring_frequency + ")";
            var recurring = <><b>Is Recurring Transaction: </b> {yesmessage}</>;

            currDay = date.split('-')[0] - date.split('-')[1] - date.split('-')[2].split('T')[0] + " " + dayOfWeek;
            displayDate = <h5><b>{date.split('-')[0]}-{date.split('-')[1]}-{date.split('-')[2].split('T')[0]} {dayOfWeek}</b></h5>;

            txnsArr.push(
                <div>
                    <div className={classname}>
                        <font size="4.5"><b>{date.split('-')[0]}-{date.split('-')[1]}-{date.split('-')[2].split('T')[0]} {dayOfWeek}</b></font><br />
                        <font size="4.5">{title} - ${amount}<br /></font>
                        <p><b>Category:</b> {category}<br />
                            <b>Payment Method:</b> {payment_method}<br />
                            {recurring}
                            {description === null ? "" : desc}</p>
                        <button id={id} className="deleteTxnButton" onClick={this.deleteTransactionButton} >delete</button>
                        <button id={id} className="duplicateTxnButton" onClick={this.duplicateTransaction} >duplicate</button>
                        <button id={id} className="updateTxnButton" onClick={this.updateTransaction} >update</button>
                    </div>
                </div>
            );
        }

        return txnsArr;
    }

    // TODO new component for this.
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
                                        var newExpDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

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
                                    } else if (this.state.isPremiumUser === false) {
                                        // construct premium user
                                        const today = new Date();
                                        var expDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

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
                            <li><h6><b>Recurring Transactions</b>: Manually inputing data is <b>boring</b> and a <b>waste of your time</b>, let a computer do it for you!
                            With Premium, you can make your transactions recurring, and they'll be <b>automatically created</b> on a frequency basis you choose.</h6></li>

                            <li><h6><b>Time Travel</b>: <b>Budgets aren't realistic</b>, because life is full of unexpected events.
                            This feature gives you the freedom to not stress about budgets, by showing you visually (using your <b>recurring transactions</b> + your estimated amount of variable spending)
                            if your current level of spending is sustainable for the long term.</h6></li>

                            <li><h6><b>Social</b>: Why does money have to be a <b>taboo</b> subject? At ZenSpending, we see things differently. 
                            Following your friends on ZenSpending see what they're spending their money on! (With the "Friends" feature, only transactions that you 
                            mark as "Public" are shared on your followers' timelines.)</h6></li>
                        </ul>
                    </div>
                    <div align="left">
                        <h5>Terms and Conditions</h5>
                        <ul>
                            <li><h6>After 1 year, you will <b>not</b> be auto re-subscribed.</h6></li>
                            <li><h6>You can cancel your membership anytime, within the first month, and receive a full refund. Just email <b>zenspending@gmail.com</b> asking for a refund.</h6></li>
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
           
            if (this.state.recurring_txns.length !== 0) {

                return (
                    this.renderPremiumUserPage()
                );
            } else {
                return (<div class="indent">
                <h4>You haven't added any transactions for the month of <b>{this.state.month}</b> yet.</h4>
                <h4>Select <b>'Add Transaction'</b> from the menu to add some!</h4>
            </div>)
            }
           

        } else if (!this.state.IS_LOADING && (!this.state.isPremiumUser || this.state.subscriptionExpired)) {
            return (
                this.renderBuyPage()
            );
        }
    }
}

export default TimeTravel;
