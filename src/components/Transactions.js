// React
import React, { Component } from 'react';

// Amplify
import API, { graphqlOperation } from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from '../aws-exports';
import { Auth } from 'aws-amplify';
import { deleteTransaction } from '../graphql/mutations';

// graphql
import { listTransactions } from '../graphql/queries';

API.configure(awsconfig);
PubSub.configure(awsconfig);

// Constants
const TXN_LIMIT = 200;

class Transactions extends Component {
    constructor(props) {
        super(props);
        this.state = { transactions: [], year: '', month: '', category: '', VISIBLE_TXNS: [] };
        this.handleChange = this.handleChange.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.deleteTransaction = this.deleteTransaction.bind(this);
        this.filterTransactions = this.filterTransactions.bind(this);
        this.updateTransaction = this.updateTransaction.bind(this);
        this.duplicateTransaction = this.duplicateTransaction.bind(this);
    }

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

renderTransactionData() {
        return this.state.VISIBLE_TXNS.map((transaction, index) => {
            const { id, title, amount, category, date, type, payment_method, description, is_recurring } = transaction;
            var classname = (type === 1) ? "incomeTxn" : "expenseTxn";

            const dayIdx = new Date(date);
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            var dayOfWeek = days[dayIdx.getDay()];


            var desc = <div className="desc"><p><b>Description:</b><br />{description}</p></div>;

            return (
                <div >
                    <div className={classname}>
                    <font size="4.5"><b>{date.split('-')[0]}-{date.split('-')[1]}-{date.split('-')[2].split('T')[0]} {dayOfWeek}</b></font><br />

                            <font size="4.5">{title} - ${amount}<br /></font>
                            <p><b>Category:</b> {category}<br />
                                <b>Payment Method:</b> {payment_method}<br />
                                <b>Is Recurring Transaction:</b> {is_recurring ? "yes" : "no"}</p>
                            {description === null ? "" : desc}
                            <button id={id} className="deleteTxnButton" onClick={this.deleteTransaction} >delete</button>
                            <button id={id} className="duplicateTxnButton" onClick={this.duplicateTransaction} >duplicate</button>
                            <button id={id} className="updateTxnButton" onClick={this.updateTransaction} >update</button>
                    </div>
                </div>
            )
        })
    }

    componentDidMount() {

        if (localStorage.getItem("year") != null) {
            this.setState({ year: localStorage.getItem("year") });
        }
        if (localStorage.getItem("month") != null) {
            this.setState({ month: localStorage.getItem("month") });
        }

        if (localStorage.getItem("category") != null) {
            this.setState({ category: localStorage.getItem("category") });
        }

        Auth.currentAuthenticatedUser().then(user => {
            let email = user.attributes.email;

            API.graphql(graphqlOperation(listTransactions, {
                limit: TXN_LIMIT,
                filter: {
                    user: { eq: email }
                }
            })).then(data => {
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
                this.setState({ transactions: sortedTxns });
                this.setState({ VISIBLE_TXNS: sortedTxns });

                if (data.data.listTransactions.nextToken !== null) {
                    window.alert("There were some recurring transactions that could not be fetched, so this page is not accurate.");
                }

                if (this.state.year !== "" && this.state.month !== "") {
                    this.filterTransactions();
                }

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
            if (localStorage.getItem("year") == null || (localStorage.getItem("year") != null && localStorage.getItem("year") != this.state.year)) {
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
            if (localStorage.getItem("month") == null || (localStorage.getItem("month") != null && localStorage.getItem("month") != this.state.month)) {
                localStorage.setItem("month", this.state.month);
            }
        }


        if (localStorage.getItem("category") == null || (localStorage.getItem("category") != null && localStorage.getItem("category") != this.state.category)) {
            console.log("updaing category");
            localStorage.setItem("category", this.state.category);
        }

        var filteredTxns = [];

        for (var txn of this.state.transactions) {
            var dateParts = txn.date.split("-");
            var year = dateParts[0];
            var month = dateParts[1];
            if (year === this.state.year && month === this.state.month) {

                if (this.state.category !== "") {
                    if (txn.category === this.state.category) {
                        filteredTxns.push(txn);
                    }
                } else {
                    filteredTxns.push(txn);
                }
            }
        }

        this.setState({ VISIBLE_TXNS: filteredTxns });
    }

    handleChange(event) {
        var target = event.target;
        var value = target.value;
        var name = target.name;
        this.setState({
            [name]: value
        });
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
                        <td>${parseFloat(catVal.amount).toFixed(2)}</td>
                    </tr>
                )
            } else {
                return (
                    <tr key={index}>
                        <td><font color={color}><b>{catVal.category}</b></font></td>
                        <td>${parseFloat(catVal.amount).toFixed(2)}</td>
                    </tr>
                )
            }
        })
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

    getMonth() {
        const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
        // const d = new Date();
        // return monthNames[d.getMonth()];
        console.log(this.state.month)
        return monthNames[parseInt(this.state.month)-1];
    }

    renderMain() {

        if (this.state.transactions.length === 0) {
            return (
                <div class="indent">
                    <h4>You haven't added any transactions yet.</h4>
                    <h4>Click <b>'Add Transactions'</b> to add some!</h4>
                </div>
            )
        } else {

            return (
                <div >
                <div className="bar">
    
                <div className="outerCCBillBox" >
                    <div className="ccBillBox">
                    <h4>{this.getMonth()} <b>Credit Card Bill:</b> ${this.getCCSpending()}</h4>
                    </div>
                </div>


                    <table id='transactions'>
                        <h4><b>Category Summary</b></h4>
                        <tbody>
                            <tr>{this.renderTableHeader()}</tr>
                            {this.renderCategoryTableData()}
                        </tbody>
                    </table>
        
                </div>
    
                <div className="barBig">
                    <h4><b>Transactions</b></h4>
                    {this.renderTransactionData()}
                </div>
    
            </div>
            )
        }
    }

    render() {
        return (
            <div>

                <div class="filtersInput">
                    <b>Year:</b>
                    <input
                        className="roundedOutline"
                        name="year"
                        type="text"
                        value={this.state.year}
                        onChange={this.handleChange} />

                    <b>&nbsp;Month:</b>
                    <input
                        className="roundedOutline"
                        name="month"
                        type="text"
                        value={this.state.month}
                        onChange={this.handleChange} />

                    <b>&nbsp;Category:</b>
                    <input
                        className="roundedOutline"
                        name="category"
                        type="text"
                        value={this.state.category}
                        onChange={this.handleChange} />
                    <button class="filter" onClick={this.filterTransactions}><b>filter transactions</b></button>
                </div>

              {this.renderMain()}

            </div>

        );
    }
}

export default Transactions;
