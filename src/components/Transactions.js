// React
import React, { Component } from 'react';

// Amplify
import API, { graphqlOperation } from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from '../aws-exports';
import { Auth } from 'aws-amplify';
import { deleteTransaction } from '../graphql/mutations';

// graphql
import { transactionsByUserDate } from '../graphql/queries';
import { listPremiumUserss } from '../graphql/queries';
import { getDoubleDigitFormat } from '../common/Utilities';

import { fetchTransactions } from '../dataAccess/TransactionAccess';

API.configure(awsconfig);
PubSub.configure(awsconfig);

// Constants
const TXN_LIMIT = 200;
var IS_PREMIUM_USER = false;
const PREMIUM_USER_LIMIT = 200;

class Transactions extends Component {
    constructor(props) {
        super(props);

        const today = new Date();

        this.state = {
            transactions: [],
            year: today.getFullYear().toString(),
            month: getDoubleDigitFormat(today.getMonth() + 1),
            category: '',
            VISIBLE_TXNS: [],
            categories: [],
            IS_LOADING: true
        };
        this.handleChange = this.handleChange.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.deleteTransaction = this.deleteTransaction.bind(this);
        this.filterTransactionsButton = this.filterTransactionsButton.bind(this);
        this.updateTransaction = this.updateTransaction.bind(this);
        this.duplicateTransaction = this.duplicateTransaction.bind(this);
    }

    // operations
    async deleteTransaction(event) {
        try {
            var txnId = event.target.id;
            await API.graphql(graphqlOperation(deleteTransaction, { input: { id: txnId } }))
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
            window.alert(err);
        }
    }

    updateTransaction(event) {
        this.props.history.push('/addTransaction/update/' + event.target.id)
    }

    duplicateTransaction(event) {
        this.props.history.push('/addTransaction/duplicate/' + event.target.id)
    }

    // helper
    filterTransactions(fyear, fmonth, category) {
        var filteredTxns = [];

        for (var txn of this.state.transactions) {
            var dateParts = txn.createdAt.split("-");
            var year = dateParts[0];
            var month = dateParts[1];

            if (year === fyear && month === fmonth) {
                if (category !== "" && category !== "ALL") {
                    if (txn.category === category) {
                        filteredTxns.push(txn);
                    }
                } else {
                    filteredTxns.push(txn);
                }
            }
        }

        this.setState({ VISIBLE_TXNS: filteredTxns });
    }

    getMonth() {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return monthNames[parseInt(this.state.month) - 1];
    }

    getCCSpending() {
        var sum = 0.0;
        for (var txn of this.state.VISIBLE_TXNS) {
            if (txn.payment_method.includes("cc") || txn.payment_method.includes("credit")) {
                if (txn.type === 2) {
                    sum += txn.amount;
                } else {
                    sum -= txn.amount;
                }
            }
        }
        return sum.toFixed(2);
    }

    // render / ui
    renderMain() {
        if (this.state.IS_LOADING) {
            return (
                <div class="indent">
                    <h4>Loading...</h4>
                </div>
            )
        } else if (!this.state.IS_LOADING && this.state.transactions.length === 0) {
            return (
                <div class="indent">
                    <h4>You haven't added any transactions yet.</h4>
                    <h4>Click <b>'Add Transactions'</b> to add some!</h4>
                </div>
            )
        } else {
            return (
                <div class="row">
                    <div class="column1" >
                        <div className="ccBillBox">
                            <h4>{this.getMonth()} <b>Credit Card Bill:</b> ${this.getCCSpending()}</h4>
                        </div>

                        <div className="ccBillBox">
                            <table id='transactions' style={{ width: "100%" }}>
                                <h4><b>Category Summary</b></h4>
                                <tbody>
                                    <tr>{this.renderTableHeader()}</tr>
                                    {this.renderCategoryTableData()}
                                </tbody>
                            </table>
                        </div>

                    </div>
                    <div class="column2">
                        <div>
                            <h4><b>Transactions</b></h4>
                            {this.renderTransactionData()}
                        </div>
                    </div>
                </div>
            )
        }
    }

    renderCategoryTableData() {
        var categoryAgg = {}
        for (var txn of this.state.VISIBLE_TXNS) {
            if (categoryAgg[txn.category] === undefined) {
                categoryAgg[txn.category] = 0.0
            }
            categoryAgg[txn.category] += txn.amount;

            if (txn.category.includes('-')) {
                var keyParts = txn.category.split('-');
                var masterKey = keyParts[0];
                if (categoryAgg[masterKey] === undefined) {
                    categoryAgg[masterKey] = 0.0
                }
                categoryAgg[masterKey] += txn.amount;
            }
        }

        // convert to array
        var categoryArray = [];
        for (var k of Object.keys(categoryAgg)) {
            categoryArray.push({ category: k, amount: categoryAgg[k] });
        }

        // sort
        var sortedCategoryArray = categoryArray.sort((a, b) => {
            return (a.category > b.category) ? 1 : -1;
        });

        return sortedCategoryArray.map((catVal, index) => {
            var color = "black";
            if (catVal.category.includes('income')) {
                color = "green";
            }

            if (catVal.category.includes('-')) {
                return (
                    <tr key={index}>
                        <td><font color={color}><i>- {catVal.category}</i></font></td>
                        <td><font color='black'>${parseFloat(catVal.amount).toFixed(2)}</font></td>
                    </tr>
                )
            } else {
                return (
                    <tr key={index}>
                        <td><font color={color}><b>{catVal.category}</b></font></td>
                        <td><font color='black'>${parseFloat(catVal.amount).toFixed(2)}</font></td>
                    </tr>
                )
            }
        })
    }

    renderTableHeader() {
        let header = ['category', 'amount'];
        return header.map((key, index) => {
            return <th key={index}>{key.toUpperCase()}</th>
        })
    }

    renderCategorySummary() {
        var categoryAgg = {}

        for (var txn of this.state.VISIBLE_TXNS) {
            if (categoryAgg[txn.category] === undefined) {
                categoryAgg[txn.category] = 0.0
            }
            if (txn.type === 2) {
                categoryAgg[txn.category] += txn.amount
            } else {
                categoryAgg[txn.category] -= txn.amount
            }
        }

        var ret = [];
        for (var key in categoryAgg) {
            ret.push(<p>{key}: ${categoryAgg[key]}</p>);
        }
        return ret;
    }

    renderOptions() {
        var catOptions = [<option value="ALL">{"ALL"}</option>];
        for (var cat of this.state.categories) {
            catOptions.push(<option value={cat}>{cat}</option>)
        }
        return (catOptions);
    }

    renderTransactionData() {
        return this.state.VISIBLE_TXNS.map((transaction, index) => {
            const { id, title, amount, category, date, type, payment_method, description, is_recurring } = transaction;
            var classname = (type === 1) ? "incomeTxn" : "expenseTxn";
            const dayIdx = new Date(date);
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            var dayOfWeek = days[dayIdx.getDay()];
            var desc = <div className="desc"><p><b>Description:</b><br />{description}</p></div>;
            var recurring = IS_PREMIUM_USER ? <><b>Is Recurring Transaction: </b> {is_recurring ? "yes" : "no"}</> : "";

            return (
                <div className={classname}>
                    <font size="4.5"><b>{date.split('-')[0]}-{date.split('-')[1]}-{date.split('-')[2].split('T')[0]} {dayOfWeek}</b></font><br />
                    <font size="4.5">{title} - ${amount}<br /></font>
                    <p><b>Category:</b> {category}<br />
                        <b>Payment Method:</b> {payment_method}<br />
                        {recurring}
                        {description === null ? "" : desc}</p>
                    <button id={id} className="deleteTxnButton" onClick={this.deleteTransaction} >delete</button>
                    <button id={id} className="duplicateTxnButton" onClick={this.duplicateTransaction} >duplicate</button>
                    <button id={id} className="updateTxnButton" onClick={this.updateTransaction} >update</button>
                </div>
            )
        })
    }

    filterTransactionsButton() {
        this.fetchTransactionsUpdateState()
    }

    // data
    fetchTransactionsUpdateState() {
        let currentComponent = this;
        this.setState({ IS_LOADING: true });
        fetchTransactions(this.state.year, this.state.month, this.state.category)
            .then(function (response) {
                currentComponent.setState({ categories: response.categories })
                currentComponent.setState({ transactions: response.transactions });
                currentComponent.setState({ VISIBLE_TXNS: response.VISIBLE_TXNS });
                currentComponent.setState({ IS_LOADING: false });
                if (currentComponent.state.year !== "" && currentComponent.state.month !== "") {
                    currentComponent.filterTransactions(currentComponent.state.year, currentComponent.state.month, currentComponent.state.category);
                }
            })
            .catch(function (response) {
                console.log(response);
            });
    }

    // life cycle
    handleChange(event) {
        var target = event.target;
        var value = target.value;
        var name = target.name;
        this.setState({
            [name]: value
        });
    }

    componentDidMount() {
        this.fetchTransactionsUpdateState()
    }

    render() {
        return (
            <div>
                <div class="filtersInput">
                    <b>Year</b> (format: YYYY):
                    <input
                        className="roundedOutline"
                        name="year"
                        type="text"
                        value={this.state.year}
                        onChange={this.handleChange} />

                    <b>&nbsp;Month</b> (format: MM):
                    <input
                        className="roundedOutline"
                        name="month"
                        type="text"
                        value={this.state.month}
                        onChange={this.handleChange} />


                    <label>
                        <b>Category:</b><br />
                        <select name="category" value={this.state.category} onChange={this.handleChange}>
                            {this.renderOptions()}
                        </select>
                    </label>

                    <button class="filter" onClick={this.filterTransactionsButton}><b>filter transactions</b></button>
                </div>

                {this.renderMain()}

            </div>

        );
    }
}

export default Transactions;
