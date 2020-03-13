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
        this.handleChange = this.handleChange.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.deleteTransaction = this.deleteTransaction.bind(this);
        this.filterTransactions = this.filterTransactions.bind(this);
        this.updateTransaction = this.updateTransaction.bind(this);
    }

    async deleteTransaction(event) {
        try {
            console.log(event.target.id);
            var txnId = event.target.id;
            const res = await API.graphql(graphqlOperation(deleteTransaction, { input: { id: txnId } }))
            console.log(res);
            window.alert("Successfully deleted your transaction!");

            var newTxns = [];
            for (var txn of this.state.transactions) {
                if (txn.id !== txnId) {
                    newTxns.push(txn);
                }
            }

            var VISIBLETxns = [];
            for (var vtxn of this.state.VISIBLE_TXNS) {
                if (vtxn.id !== txnId) {
                    VISIBLETxns.push(vtxn);
                }
            }

            this.setState({
                transactions: newTxns,
                VISIBLE_TXNS: VISIBLETxns,
            });
        } catch (err) {
            console.log("FAILURE! \n", err);
            window.alert(err);
        }
    }

    updateTransaction(event) {
        this.props.history.push('/AddTransaction/' + event.target.id)
    }

    renderTransactionData() {
        return this.state.VISIBLE_TXNS.map((transaction, index) => {
            const { id, title, amount, category, date, type, payment_method, description, is_recurring } = transaction;
            var classname = (type === 1) ? "incomeTxn" : "expenseTxn";
            
            // verified that descripted comes as null from DDB when there is no description.
            if (description === null) {
                return (
                    <div >
                        <div className={classname}>
                            <span class="left"><font size="4.5">{title} - ${amount}</font></span>
                            <span class="right"><font size="4.5">{date.split('-')[0]}-{date.split('-')[1]}-{date.split('-')[2].split('T')[0]}</font></span>
                            <br />
                            <p><b>Category:</b> {category}  <b>Payment Method:</b> {payment_method}</p>
                            <p><b>Is Recurring Transaction:</b> {is_recurring ? "yes" : "no"}</p>
                            <span class="right">
                                <button id={id} className="deleteTxnButton" onClick={this.deleteTransaction} >delete</button>
                                <button id={id} className="updateTxnButton" onClick={this.updateTransaction} >update</button>
                            </span>

                        </div><br />
                    </div>
                )
            } else {
                return (
                    <div>
                        <div className={classname}>
                            <span class="left"><font size="4.5">{title} - ${amount}</font></span>
                            <span class="right"><font size="4.5">{date.split('-')[0]}-{date.split('-')[1]}-{date.split('-')[2].split('T')[0]}</font></span>
                            <br />
                            <p><b>Category:</b> {category}  <b>Payment Method:</b> {payment_method}</p>
                            <p><b>Is Recurring Transaction:</b> {is_recurring ? "yes" : "no"}</p>
                            <p><b>Description:</b><br />{description}</p>
                            <span class="right">
                                <button id={id} className="deleteTxnButton" onClick={this.deleteTransaction} >delete</button>
                                <button id={id} className="updateTxnButton" onClick={this.updateTransaction} >update</button>
                            </span>

                        </div><br />
                    </div>
                )
            }


        })
    }

    componentDidMount() {

        if (localStorage.getItem("year") != null) {
            this.setState({year: localStorage.getItem("year") });
        }
        if (localStorage.getItem("month") != null) {
            this.setState({month: localStorage.getItem("month") });
        }

        Auth.currentAuthenticatedUser().then(user => {
            let email = user.attributes.email;

            API.graphql(graphqlOperation(listTransactions, { 
                limit: TXN_LIMIT, 
                filter: { 
                    user: { eq: email } 
                } 
            })).then(data => {

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

                if (data.data.listTransactions.nextToken !== null) {
                    window.alert("There were some recurring transactions that could not be fetched, so this page is not accurate.");
                }

                this.filterTransactions();

            }).catch((err) => {
                window.alert("Encountered error fetching your transactions: \n", err);
            })

        }).catch((err) => {
            window.alert("Encountered error fetching your username: \n", err);
        });

    }

    async filterTransactions(e) {
        if (this.state.year === "") {
            if (localStorage.getItem("year") != null) {
                this.state.year = localStorage.getItem("year");
            } else {
                window.alert("Must input value for year. (YYYY)");
                return;
            }
        } else {
            if (localStorage.getItem("year") == null || ( localStorage.getItem("year") != null && localStorage.getItem("year") != this.state.year) ) {
                localStorage.setItem("year", this.state.year);
            }
        }

        if (this.state.month === "") {
            if (localStorage.getItem("month") != null) {
                this.state.month = localStorage.getItem("month");
            } else {
                window.alert("Must input value for month. (MM)");
                return;
            }
        } else {
            if (localStorage.getItem("month") == null || ( localStorage.getItem("month") != null && localStorage.getItem("month") != this.state.month) ) {
                localStorage.setItem("month", this.state.month);
            }
        }

       
        var filteredTxns = [];

        for (var txn of this.state.transactions) {
            var dateParts = txn.date.split("-");
            var year = dateParts[0];
            var month = dateParts[1];
            if (year === this.state.year && month === this.state.month) {
                filteredTxns.push(txn);
            }
        }

        console.log("setting state.");
        this.setState({ VISIBLE_TXNS: filteredTxns });

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


    renderTableHeader() {
        let header = ['category', 'amount'];
        return header.map((key, index) => {
            return <th key={index}>{key.toUpperCase()}</th>
        })
    }
    renderPaymentMethodTableHeader() {
        let header = ['payment_method', 'amount'];
        return header.map((key, index) => {
            return <th key={index}>{key.toUpperCase()}</th>
        })
    }

    renderCategorySummary() {
        var categoryAgg = {}
        console.log("renderCategorySummary: ");

        for (var txn of this.state.VISIBLE_TXNS) {
            console.log("txn: ", txn);
            if (categoryAgg[txn.category] === undefined) {
                categoryAgg[txn.category] = 0.0
            }
            if (txn.type === 2) {
                categoryAgg[txn.category] += txn.amount
            } else {
                categoryAgg[txn.category] -= txn.amount
            }

        }

        console.log("categoryAgg: ", categoryAgg);
        var ret = [];
        for (var key in categoryAgg) {
            ret.push(<p>{key}: ${categoryAgg[key]}</p>);
        }
        return ret;
    }

    renderCategoryTableData() {
        var categoryAgg = {}
        for (var txn of this.state.VISIBLE_TXNS) {
            if (categoryAgg[txn.category] === undefined) {
                categoryAgg[txn.category] = 0.0
            }
            categoryAgg[txn.category] += txn.amount;            
        }

        // convert to array
        var categoryArray = [];
        for (var k of Object.keys(categoryAgg)) {
            categoryArray.push({category: k, amount: categoryAgg[k]});
        }

        // sort
        var sortedCategoryArray = categoryArray.sort((a,b) => {
            return (a.amount > b.amount) ? -1 : 1;
        });

        return sortedCategoryArray.map((catVal, index) => {
            return (
                <tr key={index}>
                    <td>{catVal.category}</td>
                    <td>${parseFloat(catVal.amount).toFixed(2)}</td>
                </tr>
            )
        })
    }

    renderPaymentMethodTableData() {
        var paymentMethodAgg = {}
        for (var txn of this.state.VISIBLE_TXNS) {
            if (paymentMethodAgg[txn.payment_method] === undefined) {
                paymentMethodAgg[txn.payment_method] = 0.0
            }
            if (txn.type === 2) {
                paymentMethodAgg[txn.payment_method] += txn.amount
            } else {
                paymentMethodAgg[txn.payment_method] -= txn.amount
            }
        }

        // convert to array
        var paymentMethodArray = [];
        for (var k of Object.keys(paymentMethodAgg)) {
            paymentMethodArray.push({paymentMethod: k, amount: paymentMethodAgg[k]});
        }

        // sort
        var sortedPaymentMethodArray = paymentMethodArray.sort((a,b) => {
            return (a.amount > b.amount) ? -1 : 1;
        });

        return sortedPaymentMethodArray.map((paymentMethodVal, index) => {
            return (
                <tr key={index}>
                    <td>{paymentMethodVal.paymentMethod}</td>
                    <td>${parseFloat(paymentMethodVal.amount).toFixed(2)}</td>
                </tr>
            )
        })
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

                <div >
                    <div class="barbooks">
                        <table id='transactions'>
                        <h3>Category Summary</h3>
                            <tbody>
                                <tr>{this.renderTableHeader()}</tr>
                                {this.renderCategoryTableData()}
                            </tbody>
                        </table>
                    </div>

                    <div class="barbooks">
                        <table id='transactions'>
                        <h3>Payment Method Summary</h3>
                            <tbody>
                                <tr>{this.renderPaymentMethodTableHeader()}</tr>
                                {this.renderPaymentMethodTableData()}
                            </tbody>
                        </table>
                    </div>
                </div>
               

                <div >
                    {this.renderTransactionData()}
                </div>

            </div>

        );
    }
}

export default Transactions;
