import React, { Component } from 'react';
import { graphqlDateFromJSDate } from '../common/Utilities';
import API, { graphqlOperation } from '@aws-amplify/api';

import { Auth } from 'aws-amplify';

import { addPremiumUser, updatePremiumUserWithId} from '../dataMutation/PremiumUserMutation';

// GraphQl Mutations
import { checkIfPremiumUser } from '../dataAccess/PremiumUserAccess';

// PayPal
import { PayPalButton } from "react-paypal-button-v2";

class Premium extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isPremiumUser: false,
            expiryDate: ""
            };

        this.handleChange = this.handleChange.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.renderbuttonIfNotPremium = this.renderbuttonIfNotPremium.bind(this);

    }


    handleChange(event) {

        console.log("HAND CHANGE");

        var target = event.target;
        var value = target.value;
        var name = target.name;
        this.setState({
            [name]: value
        });
    }


    async updatePremiumUser(premiumUser) {
        // submit
        try {
            await updatePremiumUserWithId(premiumUser);
        } catch (err) {
            console.log(err);
            window.alert("Encountered error updating your premium user subscription.\nEmail: zenspending@gmail for support.");
        }
    }

    async addNewPremiumUser(premiumUser) {
        // submit
        try {
            await addPremiumUser( premiumUser );
        } catch (err) {
            console.log(err);
            window.alert("Encountered error adding you to our premium user list.\nEmail: zenspending@gmail for support.");
        }
    }

    componentDidMount() {
        console.log("componentDidMount");

        checkIfPremiumUser()
            .then((response) => {
                this.setState({
                    isPremiumUser: response.isPremiumUser,
                    expiryDate: response.expiryDate.toString()
                });
            })
            .catch(function (response) {
                console.log(response);
            });
    }

    refreshPage() {
        window.location.reload(false);
    }

    renderbuttonIfNotPremium() {        
        if (this.state.isPremiumUser) {
            return (
                <div className="premiumFeatureBackground">
                    <h4>You're Subscribed to ZenSpending Premium!</h4>
                    <h5><b><span style={{color:"black"}}>Subscription expires on:</span></b><br/><i>{this.state.expiryDate}</i></h5>
                </div>
            );

        } else {
            return (
                <div className="premiumFeatureBackground">
                    <h4>Upgrade Now</h4>
                    <h5><b>ZenSpending Premium</b></h5>
                    <h5>$15.99 for 1 year</h5>
                    <PayPalButton
                        amount="3.99"
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
            );
        }
    }
    render() {

        return (
            <div className="indent">
                <div align="center">
                    <div>
                        <h4><b>ZenSpending</b> Premium</h4>
                    </div>

                    <div>
                        {this.renderbuttonIfNotPremium()}
                    </div>
                    <div align="left">
                        <h5>Features</h5>
                        <ul>
                            <li><h6><b>Recurring Transactions</b>: Manually inputing data is <b>boring</b> and a <b>waste of your time</b>, let a computer do it for you!
                        With Premium, you can make your transactions recurring, and they'll be <b>automatically created</b> on a frequency basis you choose.</h6></li>

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
}

export default Premium;
