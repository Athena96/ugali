// React
import React, { Component, PureComponent } from 'react';
// import LineChart from 'react-linechart';
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
// import '../../node_modules/react-linechart/dist/styles.css';

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

// Data Access
import { fetchRecurringTransactions, fetchPublicTransactionsByUser} from '../dataAccess/TransactionAccess';
import { checkIfPremiumUser } from '../dataAccess/PremiumUserAccess';

// Common
import { getDoubleDigitFormat, convertDateStrToGraphqlDate, graphqlDateFromJSDate } from '../common/Utilities';
import { Frequencies, getLastDayOfMonthFromDate } from '../common/Utilities';

API.configure(awsconfig);
PubSub.configure(awsconfig);



class Friends extends Component {
    constructor(props) {
        super(props);
        this.shownRecorded = {};
        this.state = {
            user: "",
            isPremiumUser: false,
            subscriptionExpired: true,
            premiumUsers: {},
            IS_LOADING: true,
            friendsTransactions: []
        };
        this.handleChange = this.handleChange.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
    }

    // operation
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

    // life cycle
    componentDidMount() {
        let currentComponent = this;
        this.setState({ IS_LOADING: true });
        checkIfPremiumUser()
            .then(function (response) {
                currentComponent.setState({ isPremiumUser: response.isPremiumUser });
                currentComponent.setState({ subscriptionExpired: response.subscriptionExpired });
                currentComponent.setState({ premiumUser: response.premiumUser });
                currentComponent.setState({ IS_LOADING: false });
                console.log(currentComponent.state);

                var today = new Date();
                var startDate = (new Date()).setDate(today.getDate() - 30);
            
                // for each friend ...
                fetchPublicTransactionsByUser(startDate, today, "italianstallion26.21@gmail.com").then(function (response) {
                    currentComponent.setState({friendsTransactions: response.friends_transactions});
                }).catch(function (response) {
                    console.log(response);
                });


            })
            .catch(function (response) {
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


    renderRecurringTransactions() {
        var txnsArr = [];
        var displayDate;
        var currDay = ""
        for (var transaction of this.state.friendsTransactions) {
            const { id, title, user, amount, category, date, recurring_frequency, type, payment_method, description, is_recurring } = transaction;
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
                        <p>
                            <b>User:</b> {user}<br />
                            <b>Category:</b> {category}<br />
                            <b>Payment Method:</b> {payment_method}<br />
                            {recurring}
                            </p>
                    </div>
                </div>
            );
        }

                                /* <button id={id} className="deleteTxnButton" onClick={this.deleteTransactionButton} >delete</button>
                        <button id={id} className="duplicateTxnButton" onClick={this.duplicateTransaction} >duplicate</button>
                        <button id={id} className="updateTxnButton" onClick={this.updateTransaction} >update</button> */

        return txnsArr;
    }
    renderPremiumUserPage() {
        return (
            <div class="inset" >
                <h4><b>Recurring Transactions</b></h4>
                {this.renderRecurringTransactions()}
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
                            <li><h6><b>Recurring Transactions</b>: Manually inputing data is <b>boring</b> and a <b>waste of your time</b>, let a computer do it for you!
                            With Premium, you can make your transactions recurring, and they'll be <b>automatically created</b> on a frequency basis you choose.</h6></li>

                            <li><h6><b>Time Travel</b>: <b>Budgets aren't realistic</b>, because life is full of unexpected events.
                            This feature gives you the freedom to not stress about budgets, by showing you visually (using your <b>recurring transactions</b> + your estimated amount of variable spending)
                            if your current level of spending is sustainable for the long term.</h6></li>
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

export default Friends;
