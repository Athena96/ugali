// React
import React, { Component } from 'react';

// Amplify
import API, { graphqlOperation } from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from './aws-exports';
import { Auth } from 'aws-amplify';
import { deleteTransaction } from './graphql/mutations';

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
        this.state = { transactions: [], year: '', month: '', VISIBLE_TXNS: [] };
        this.handleChange = this.handleChange.bind(this); // handles state change
        this.componentDidMount = this.componentDidMount.bind(this); 
        this.deleteTransaction = this.deleteTransaction.bind(this); 
        this.filterTransactions = this.filterTransactions.bind(this); 
        this.updateTransaction = this.updateTransaction.bind(this); 

    }

    async deleteTransaction(event) {
        try {
            console.log(event.target.id);
            var txnId = event.target.id;
            const res = await API.graphql(graphqlOperation(deleteTransaction, {input: {id: txnId}}))
            console.log(res);
            window.alert("Successfully deleted your transaction!");
            var newTxns = [];
            for (var txn of this.state.transactions) {
                if (txn.id !== txnId) {
                    newTxns.push(txn);
                }
            }
            this.setState({
                transactions: newTxns
            });
        } catch (err) {
            console.log("FAILURE! \n",err);
            window.alert(err);
        }
    }

    updateTransaction(event) {
        this.props.history.push('/AddTransaction/'+event.target.id)
    }

    renderTransactionData() {
        return this.state.VISIBLE_TXNS.map((transaction, index) => {
            const { id, title, amount, category, date, type, payment_method, description} = transaction;
            console.log("ID: ",id);
            var classname = (type === 1) ? "incomeTxn" : "expenseTxn";
            console.log(description);
            if (description === null) {
                return (
                    <div >
                    <div className={classname}>
                    <span class="left"><font size="4.5">{title} - ${amount}</font></span>
                    <span class="right"><font size="4.5">{date.split('-')[0]}-{date.split('-')[1]}-{date.split('-')[2].split('T')[0]}</font></span>
                    <br/>
                    <p><b>Category:</b> {category}  <b>Payment Method:</b> {payment_method}</p>
                    <span class="right">
                        <button id={id} className="deleteTxnButton" onClick={this.deleteTransaction} >delete</button>
                        <button id={id} className="updateTxnButton" onClick={this.updateTransaction} >update</button>
                    </span>

                    </div><br/>
                    </div>
                )
            } else {
                return (
                    <div>
                    <div className={classname}>
                    <span class="left"><font size="4.5">{title} - ${amount}</font></span>
                    <span class="right"><font size="4.5">{date.split('-')[0]}-{date.split('-')[1]}-{date.split('-')[2].split('T')[0]}</font></span>
                    <br/>
                    <p><b>Category:</b> {category}  <b>Payment Method:</b> {payment_method}</p>
                    <p><b>Description:</b><br/>{description}</p>
                    <span class="right">
                        <button id={id} className="deleteTxnButton" onClick={this.deleteTransaction} >delete</button>
                        <button id={id} className="updateTxnButton" onClick={this.updateTransaction} >update</button>
                    </span>

                    </div><br/>
                    </div>
                )
            }
            
            
        })
    }

    renderCategorySummary() {
        var categoryAgg = {}

        for (var txn of this.state.VISIBLE_TXNS) {
            if (categoryAgg[txn.category] === undefined) {
                categoryAgg[txn.category] = 0.0
            } else {
                if (txn.type === 2) {
                    categoryAgg[txn.category] += txn.amount
                } else {
                    categoryAgg[txn.category] -= txn.amount
                }
            }
        }

        console.log("categoryAgg: ", categoryAgg);
        for (var key in categoryAgg) {
            return (
            <p>{key}: ${categoryAgg[key]}</p>
            )
        }

    }

    renderPaymentMethod() {
        var categoryAgg = {}

        for (var txn of this.state.VISIBLE_TXNS) {
            if (categoryAgg[txn.payment_method] === undefined) {
                categoryAgg[txn.payment_method] = 0.0
            } else {
                if (txn.type === 2) {
                    categoryAgg[txn.payment_method] += txn.amount
                } else {
                    categoryAgg[txn.payment_method] -= txn.amount
                }
            }
        }

        console.log("categoryAgg: ", categoryAgg);
        for (var key in categoryAgg) {
            return (
            <p>{key}: ${categoryAgg[key]}</p>
            )
        }

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
                this.setState({ VISIBLE_TXNS: sortedTxns });

            }).catch((err) => {
                window.alert("Encountered error fetching your transactions: \n",err);
            })
            
        }).catch((err) => {
            window.alert("Encountered error fetching your username: \n",err);
        });
        
    }

    async filterTransactions(e) {
        console.log("SUBMIT")
        if (this.state.year === null || this.state.year === undefined || this.state.year === "" || 
        this.state.month === null || this.state.month === undefined || this.state.month === "") {
            window.alert("Must enter year and month (YYYY for year, and MM for month)");
            return;
        }
        var filteredTxns = [];

        for (var txn of this.state.transactions) {
            console.log(txn.date);
            console.log(typeof txn.date);
            var dateParts = txn.date.split("-");
            var year = dateParts[0];
            var month = dateParts[1];
            if (year === this.state.year && month === this.state.month) {
                filteredTxns.push(txn);
            }
        }

        this.setState({VISIBLE_TXNS: filteredTxns})
        
    }

    handleChange(event) {
        var target = event.target;
        var value = target.value;
        var name = target.name;
        this.setState({
            [name]: value
        });
        console.log(this.state.year);
        console.log(this.state.month);
    }

    render() {
        return (
                    
                <div>

                    <div>
                        <input
                        className="roundedOutline"
                        name="year"
                        type="text"
                        value={this.state.year}
                        onChange={this.handleChange} />

                        <input
                        className="roundedOutline"
                        name="month"
                        type="text"
                        value={this.state.month}
                        onChange={this.handleChange} />
                
                        <button class="filter" onClick={this.filterTransactions}>filter</button>
                    </div>

                    <div id="container">
                    
                        <div id="leftThing">
                            <h3>Category Summary</h3>
                            {this.renderCategorySummary()}
                        </div>

                        <div id="content">
                            <h3>Payment Method</h3>
                            {this.renderPaymentMethod()}
                        </div>

                        <div id="rightThing">
                        </div>
                    </div>

                <div>
                    {this.renderTransactionData()}
                </div>

            </div>

        );
    }
}

export default Transactions;
