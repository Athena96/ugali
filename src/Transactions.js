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
        this.state = { transactions: [] };
        this.handleChange = this.handleChange.bind(this); // handles state change
        this.componentDidMount = this.componentDidMount.bind(this); 
    }

    renderTransactionData() {
        return this.state.transactions.map((transaction, index) => {
            const { id, title, amount, category, date, type, payment_method, description} = transaction;
            console.log("ID: ",id);
            var classname = (type === 1) ? "incomeTxn" : "expenseTxn";
            
            return (
                <div>
                <div className={classname}>
                <span class="left"><font size="4.5">{title}- ${amount}</font></span>
                <span class="right">{date.split('-')[0]}-{date.split('-')[1]}-{date.split('-')[2].split('T')[0]}</span>​
                <p><b>Category:</b> {category}  <b>Payment Method:</b> {payment_method}</p>
                <p><b>Description:</b><br/>{description}</p>
                </div><br/>
                </div>
            )
            
        })
    }

    componentDidMount() {

        Auth.currentAuthenticatedUser().then(user => {
            let email = user.attributes.email;

            console.log("Fetching transactions for: " + email);
            API.graphql(graphqlOperation(listTransactions, { limit: TXN_LIMIT, filter: { user: { eq: email } } })).then(data => {

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
                console.log(sortedTxns);
                this.setState({ transactions: sortedTxns });
            }).catch((err) => {
                window.alert("Encountered error fetching your transactions: \n",err);
            })
            
        }).catch((err) => {
            window.alert("Encountered error fetching your username: \n",err);
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
        return (
            <div>
                {this.renderTransactionData()}
            </div>
        );
    }
}

export default Transactions;
