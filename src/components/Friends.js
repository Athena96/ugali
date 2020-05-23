// React
import React, { Component } from 'react';

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
import { addFriend, deleteFriendWithId } from '../dataMutation/FriendMutation';

// Data Access
import { fetchPublicTransactionsByUser } from '../dataAccess/TransactionAccess';
import { fetchFriends } from '../dataAccess/FriendsAccess';

import { checkIfPremiumUser } from '../dataAccess/PremiumUserAccess';

// Common
import { graphqlDateFromJSDate } from '../common/Utilities';

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
            friendsTransactions: [],
            friends: [],
            addFriendEmail: ""
        };
        this.handleChange = this.handleChange.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.addFriendButton = this.addFriendButton.bind(this);
        this.deleteFriendButton = this.deleteFriendButton.bind(this);
    }

    // operation
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

    async loadFriendsAndTimeline() {
        this.setState({ IS_LOADING: true });
        const premRes = await checkIfPremiumUser();

        this.setState({ isPremiumUser: premRes.isPremiumUser });
        this.setState({ subscriptionExpired: premRes.subscriptionExpired });
        this.setState({ premiumUser: premRes.premiumUser });
        this.setState({ IS_LOADING: false });

        var today = new Date();
        var startDate = (new Date()).setDate(today.getDate() - 30);

        // for each friend ...
        const response = await fetchFriends();
        this.setState({ friends: response.friends });

        for (const f of response.friends) {
            const res = await fetchPublicTransactionsByUser(startDate, today, f.myFriend);
            var updatedFriendsTxnsList = this.state.friendsTransactions;
            for (const t of res.friends_transactions) {
                updatedFriendsTxnsList.push(t);
            }

            this.setState({ friendsTransactions: updatedFriendsTxnsList });
            this.setState({ IS_LOADING: false });
        }

    }

    // life cycle
    componentDidMount() {
        this.loadFriendsAndTimeline();
    }

    addFriendButton() {
        addFriend(this.state.addFriendEmail).then(function (response) {
            if (response.friendIsPremium) {
                window.alert("Successfully added your friend '" + response.addedFriend + "' !");
            } else {
                window.alert("Sorry, we couldn't add this user as your friend because they are not a Premium Subscriber.");
            }
        })
    }

    deleteFriendButton(event) {
        const idOfDeleteFriend = event.target.id;
        deleteFriendWithId(idOfDeleteFriend).then((response) => {
            window.alert("Successfully deleted your friend!");
            var newFriends = [];
            for (var friend of this.state.friends) {
                if (friend.id !== idOfDeleteFriend) {
                    newFriends.push(friend);
                }
            }

            this.setState({
                friends: newFriends,
            });
        })
    }

    handleChange(event) {
        var target = event.target;
        var value = target.value;
        var name = target.name;

        this.setState({
            [name]: value
        });
    }

    renderAddFriends() {
        return (
            <div>
                <label>
                    <input
                        className="addFriendInput"
                        placeholder="friend email"
                        name="addFriendEmail"
                        type="text"
                        value={this.state.addFriendEmail}
                        onChange={this.handleChange} />
                </label> <button className="addFriendButton" onClick={this.addFriendButton} >add friend</button>

            </div>
        );
    }

    renderFriends() {
        var friends = [];
        var displayDate;
        var currDay = ""
        for (var friend of this.state.friends) {
            const { id, me, myFriend, createdAt } = friend;
            var classname = "friendsListEntry";
            const dayIdx = new Date(createdAt);
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            var dayOfWeek = days[dayIdx.getDay()];

            currDay = createdAt.split('-')[0] - createdAt.split('-')[1] - createdAt.split('-')[2].split('T')[0] + " " + dayOfWeek;
            displayDate = <h5><b>{createdAt.split('-')[0]}-{createdAt.split('-')[1]}-{createdAt.split('-')[2].split('T')[0]} {dayOfWeek}</b></h5>;

            friends.push(
                <div>
                    <div className={classname}>
                        <font size="4.5">{myFriend}<br /></font>
                        <font size="4.5">added on <b>{createdAt.split('-')[0]}-{createdAt.split('-')[1]}-{createdAt.split('-')[2].split('T')[0]} {dayOfWeek}</b></font><br />
                        <button id={id} className="deleteFriendButton" onClick={this.deleteFriendButton} >delete friend</button>
                    </div>
                </div>
            );
        }

        return friends;
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
                            {description === null ? "" : desc}</p>
                    </div>
                </div>
            );
        }
        return txnsArr;
    }

    renderPremiumUserPage() {
        return (
            <div class="inset" >
                <div  >
                    <h4><b>Add Friends</b></h4>
                    {this.renderAddFriends()}
                </div>
                <div  >
                    <h4><b>Friends</b></h4>
                    {this.renderFriends()}
                </div>
                <div >
                    <h4><b>Friends Transactions</b></h4>
                    {this.renderRecurringTransactions()}
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
