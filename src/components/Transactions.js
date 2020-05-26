// React
import React, { Component } from 'react';

// Amplify
import API from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from '../aws-exports';

// Utilities
import { getDoubleDigitFormat, getDisplayTransactions } from '../common/Utilities';

// Data Access
import { fetchTransactions } from '../dataAccess/TransactionAccess';
import { checkIfPremiumUser } from '../dataAccess/PremiumUserAccess';

// Data Mutation
import { deleteTransactionWithId } from '../dataMutation/TransactionMutation';

API.configure(awsconfig);
PubSub.configure(awsconfig);

// Constants
var IS_PREMIUM_USER = false;
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
class Transactions extends Component {
    constructor(props) {
        super(props);

        const today = new Date();
        this.state = {
            transactions: [],
            year: today.getFullYear().toString(),
            month: monthNames[today.getMonth()],
            category: '',
            VISIBLE_TXNS: [],
            categories: [],
            IS_LOADING: true
        };
        this.handleChange = this.handleChange.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.deleteTransactionButton = this.deleteTransactionButton.bind(this);
        this.updateTransaction = this.updateTransaction.bind(this);
        this.duplicateTransaction = this.duplicateTransaction.bind(this);
        this.fetchTransactionsUpdateState = this.fetchTransactionsUpdateState.bind(this);
    }

    // operations
    deleteTransactionButton(event) {
        const txnId = event.target.id;
        deleteTransactionWithId(txnId)
            .then( (response) => {
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

    // helper
    filterTransactions(fyear, fmonth, category) {
        var filteredTxns = [];

        for (var txn of this.state.transactions) {
            var dateParts = txn.date.split("-");
            var year = dateParts[0];
            var month = dateParts[1];

            if (year === fyear && month === fmonth) {
                if (category !== "" && category !== "ALL") {
                    // is category a sub or not?
                    if (category.includes("-")) {
                        // use exact match if filtering to sub cat level
                        if (txn.category === category) {
                            filteredTxns.push(txn);
                        }
                    } else {
                        // get the primary cat
                        const txnPrimaryCat = txn.category.split("-")[0];
                        if (txnPrimaryCat === category) {
                            filteredTxns.push(txn);
                        }
                    }
                } else {
                    filteredTxns.push(txn);
                }
            }
        }

        this.setState({ VISIBLE_TXNS: filteredTxns });
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
                    <h4>You haven't added any transactions for the month of <b>{this.state.month}</b> yet.</h4>
                    <h4>Select <b>'Add Transaction'</b> from the menu to add some!</h4>
                </div>
            )
        } else {
            return (
                <div class="row">

                    <div class="column1" >
                        <div className="ccBillBox">
                            <h4>{this.state.month} <b>Credit Card Bill:</b> ${this.getCCSpending()}</h4>
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

    renderCategoryDropdown() {
        var catOptions = [<option value="ALL">{"ALL"}</option>];
        var cpArr = this.state.categories;
        cpArr.sort((a, b) => {
            return (a > b) ? 1 : -1;
        });

        var primaryCategories = []
        for (var cat of cpArr) {
            catOptions.push(<option value={cat}>{cat}</option>)

            if (cat.split('-').length > 1) {
                const primaryCategory = cat.split('-')[0];
                if (!primaryCategories.includes(primaryCategory)) {
                    catOptions.push(<option value={primaryCategory}>{primaryCategory}</option>);
                    primaryCategories.push(primaryCategory);
                }
            } else {
                primaryCategories.push(cat);
            }
        }
        return (catOptions);
    }

    renderTransactionData() {
        return (
            getDisplayTransactions(this.state.VISIBLE_TXNS, IS_PREMIUM_USER, this.deleteTransactionButton, this.updateTransaction, this.duplicateTransaction, false, true) 
       );
    }

    renderYearDropdown() {
        var yearOptions = [];
        for (var year = 1967; year <= 2096; year += 1) {
            yearOptions.push(<option value={year.toString()}>{year}</option>)
        }
        return (yearOptions);
    }

    renderMonthDropdown() {
        var monthOptions = [];
        for (var monthIdx = 0; monthIdx < monthNames.length; monthIdx += 1) {
            monthOptions.push(<option value={monthNames[monthIdx]}>{monthNames[monthIdx]}</option>)
        }
        return (monthOptions);
    }

    // data
    fetchTransactionsUpdateState() {
        this.setState({ IS_LOADING: true });
        fetchTransactions(this.state.year, getDoubleDigitFormat(monthNames.indexOf(this.state.month) + 1))
            .then( (response) => {
                this.setState({
                    categories: response.categories,
                    transactions: response.transactions,
                    VISIBLE_TXNS: response.VISIBLE_TXNS,
                    IS_LOADING: false
                }, () => {
                    this.filterTransactions(this.state.year, getDoubleDigitFormat(monthNames.indexOf(this.state.month) + 1), this.state.category);
                })
            })
            .catch(function (response) {
                console.log(response);
            });
    }

    checkPremiumUser() {
        checkIfPremiumUser()
            .then(function (response) {
                IS_PREMIUM_USER = response.isPremiumUser
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
        this.setState({ [name]: value }, () => {
            this.fetchTransactionsUpdateState();
        });
    }

    componentDidMount() {
        this.checkPremiumUser()
        this.fetchTransactionsUpdateState()
    }

    render() {
        return (
            <div>
                <div class="filtersInput">

                    <div class="barStack">
                        <label>
                            <b>Year:</b><br />
                            <select name="year" value={this.state.year} onChange={this.handleChange}>
                                {this.renderYearDropdown()}
                            </select>
                        </label>
                    </div>

                    <div class="barStack">
                        <label>
                            <b>Month:</b><br />
                            <select name="month" value={this.state.month} onChange={this.handleChange}>
                                {this.renderMonthDropdown()}
                            </select>
                        </label>
                    </div>

                    <div class="barStack">
                        <label>
                            <b>Category:</b><br />
                            <select name="category" value={this.state.category} onChange={this.handleChange}>
                                {this.renderCategoryDropdown()}
                            </select>
                        </label>
                    </div>
                    <br clear="all" />

                </div>
                <div className="fl">
                    {this.renderMain()}
                </div>

            </div>

        );
    }
}

export default Transactions;
