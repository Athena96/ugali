// React
import React, { Component } from 'react';

// Utilities
import { getDoubleDigitFormat, renderDisplayTransactions, monthNames, aggregateTransactions } from '../common/Utilities';

// Data Access
import { fetchTransactions } from '../dataAccess/TransactionAccess';
import { checkIfPremiumUser } from '../dataAccess/PremiumUserAccess';
import { getAvgSpendingMapForUser } from '../dataAccess/CustomDataAccess';

// Data Mutation
import { deleteTransactionWithId } from '../dataMutation/TransactionMutation';

class Transactions extends Component {
    constructor(props) {
        super(props);

        const today = new Date();
        this.state = {
            monthTransactions: [],
            year: today.getFullYear().toString(),
            month: monthNames[today.getMonth()],
            category: '',
            displayTransactions: [],
            categories: [],
            IS_LOADING: true,
            avgSpendingMap: {},
            IS_PREMIUM_USER: false
        };
        this.handleChange = this.handleChange.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.deleteTransactionButton = this.deleteTransactionButton.bind(this);
        this.updateTransaction = this.updateTransaction.bind(this);
        this.duplicateTransaction = this.duplicateTransaction.bind(this);
        this.fetchTransactionsUpdateState = this.fetchTransactionsUpdateState.bind(this);
    }

    // operations
    // 27
    deleteTransactionButton(event) {
        const txnId = event.target.id;
        deleteTransactionWithId(txnId)
            .then((response) => {
                window.alert("Successfully deleted your transaction!");
                var newTxns = [];
                for (var txn of this.state.monthTransactions) {
                    if (txn.id !== txnId) {
                        newTxns.push(txn);
                    }
                }

                var VISIBLETxns = [];
                for (var vtxn of this.state.displayTransactions) {
                    if (vtxn.id !== txnId) {
                        VISIBLETxns.push(vtxn);
                    }
                }
                this.setState({
                    monthTransactions: newTxns,
                    displayTransactions: VISIBLETxns,
                });
            })
            .catch(function (response) {
                console.log(response);
                window.alert(response);
            });
    }

    // 1
    updateTransaction(event) {
        this.props.history.push('/addTransaction/update/' + event.target.id)
    }

    // 1
    duplicateTransaction(event) {
        this.props.history.push('/addTransaction/duplicate/' + event.target.id)
    }

    // helper
    // 28
    filterTransactions(fyear, fmonth, category) {
        var filteredTxns = [];

        for (var txn of this.state.monthTransactions) {
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
        this.setState({ displayTransactions: filteredTxns });
    }

    // 12
    getCCSpending() {
        var sum = 0.0;
        for (var txn of this.state.displayTransactions) {
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
    // 48
    renderMain() {
        const year = (new Date()).getFullYear();
        let header = ['category', 'amount', 'average ('+year+')'];
        const categoryHeader = header.map((key, index) => {
            return <th key={index}>{key.toUpperCase()}</th>
        })

        if (this.state.IS_LOADING) {
            return (
                <div class="indent">
                    <h4>Loading...</h4>
                </div>
            )
        } else if (!this.state.IS_LOADING && this.state.monthTransactions.length === 0) {
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
                                    <tr>{categoryHeader}</tr>
                                    {this.renderCategoryTableData()}
                                </tbody>
                            </table>
                        </div>

                    </div>
                    <div class="column2">
                        <div>
                            <h4><b>Transactions</b></h4>
                            {renderDisplayTransactions(this.state.displayTransactions, this.state.IS_PREMIUM_USER, this.deleteTransactionButton, this.updateTransaction, this.duplicateTransaction, false, true)}
                        </div>
                    </div>
                </div>
            )
        }
    }

    // 21
    renderCategoryTableData() {
        var categoryArray = [];
        var categoryAggMap = aggregateTransactions(this.state.displayTransactions);
        Object.keys(categoryAggMap).forEach( category => {
            categoryArray.push({ category: category, amount: categoryAggMap[category] });
        });

        return categoryArray
        .sort((a, b) => {
            return (a.category > b.category) ? 1 : -1;
        }).map((catVal, index) => {
            const color = catVal.category.indexOf('income') !== 0 ? "black" : "green";
            const avgSpending = this.state.avgSpendingMap[catVal.category] ? this.state.avgSpendingMap[catVal.category].sum / this.state.avgSpendingMap[catVal.category].count : catVal.amount;
            const nametd = catVal.category.includes('-') ? <td><font color={color}><i>- {catVal.category}</i></font></td> : <td><font color={color}><b>{catVal.category}</b></font></td>;
            return (
                <tr key={index}>
                    {nametd}
                    <td><font color='black'>${parseFloat(catVal.amount).toFixed(2)}</font></td>
                    <td><font color='black'>${parseFloat(avgSpending).toFixed(2)}</font></td>
                </tr>
            );
        })
    }

    // 21
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

    // 4
    renderYearDropdown() {
        var yearOptions = [];
        for (var year = 1967; year <= 2096; year += 1) {
            yearOptions.push(<option value={year.toString()}>{year}</option>)
        }
        return (yearOptions);
    }

    // 4
    renderMonthDropdown() {
        var monthOptions = [];
        for (var monthIdx = 0; monthIdx < monthNames.length; monthIdx += 1) {
            monthOptions.push(<option value={monthNames[monthIdx]}>{monthNames[monthIdx]}</option>)
        }
        return (monthOptions);
    }

    // data
    // 24
    fetchTransactionsUpdateState() {
        this.setState({ IS_LOADING: true });
        getAvgSpendingMapForUser()
            .then((data) => {
                if (data) {
                    this.setState({
                        avgSpendingMap: data.categoryMap
                    });
                }

                    fetchTransactions(this.state.year, getDoubleDigitFormat(monthNames.indexOf(this.state.month) + 1))
                        .then((response) => {
                            this.setState({
                                categories: response.categories,
                                monthTransactions: response.transactions,
                                displayTransactions: response.VISIBLE_TXNS,
                                IS_LOADING: false
                            }, () => {
                                this.filterTransactions(this.state.year, getDoubleDigitFormat(monthNames.indexOf(this.state.month) + 1), this.state.category);
                            })
                        })
                        .catch(function (response) {
                            console.log(response);
                        });
            });
    }

    // 6
    checkPremiumUser() {
        checkIfPremiumUser()
            .then(function (response) {
                this.setState({IS_PREMIUM_USER: response.isPremiumUser});
            })
            .catch(function (response) {
                console.log(response);
            });
    }

    // life cycle
    // 6
    handleChange(event) {
        var target = event.target;
        var value = target.value;
        var name = target.name;
        this.setState({ [name]: value }, () => {
            this.fetchTransactionsUpdateState();
        });
    }

    // 2
    componentDidMount() {
        this.checkPremiumUser()
        this.fetchTransactionsUpdateState()
    }

    // 39
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
