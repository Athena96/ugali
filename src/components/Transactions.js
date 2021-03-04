// React
import React, { Component } from 'react';

// Utilities
import { getDoubleDigitFormat, renderDisplayTransactions, monthNames, aggregateTransactions, filterTransactions } from '../common/Utilities';

// Data Access
import { fetchTransactions } from '../dataAccess/TransactionAccess';
import { checkIfPremiumUser } from '../dataAccess/PremiumUserAccess';
import { getAvgSpendingMapForUser } from '../dataAccess/CustomDataAccess';

// Data Mutation
import { deleteTransactionWithId } from '../dataMutation/TransactionMutation';

import { LineChart } from 'react-chartkick'
import 'chart.js'

const nums = {
    "January": "01",
    "February": "02",
    "March": "03",
    "April": "04",
    "May": "05",
    "June": "06",
    "July": "07",
    "August": "08",
    "September": "09",
    "October": "10",
    "November": "11",
    "December": "12"
};

class Transactions extends Component {
    constructor(props) {
        super(props);

        const today = new Date();
        this.state = {
            monthTransactions: [],
            year: today.getFullYear().toString(),
            month: monthNames[today.getMonth()],
            monthNum: nums[monthNames[today.getMonth()]],
            category: '',
            displayTransactions: [],
            categories: [],
            IS_LOADING: true,
            avgSpendingMap: {},
            IS_PREMIUM_USER: false,
            email: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.deleteTransactionButton = this.deleteTransactionButton.bind(this);
        this.updateTransaction = this.updateTransaction.bind(this);
        this.duplicateTransaction = this.duplicateTransaction.bind(this);
        this.fetchTransactionsUpdateState = this.fetchTransactions.bind(this);
    }

    /* UI operations */
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

    /* data */
    // 24
    fetchTransactions() {


        this.setState({ IS_LOADING: true });
        getAvgSpendingMapForUser()
            .then((data) => {

                // ccSum
                var ccData = [];
                for (const year of Object.keys(data)) {
                    for (const month of  Object.keys(data[year])) {
                        const yrmoSum = data[year][month]["ccSum"] !== undefined ? data[year][month]["ccSum"] : 0.0;
                        ccData.push({
                            year: year,
                            month: month,
                            ccSum: yrmoSum
                        });
                    }
                }
                console.log("ccData " + JSON.stringify(ccData));

                this.setState({
                    avgSpendingMap: data,
                    ccSumData: ccData
                }, () => {
                    if (this.state.month !== 'ALL') {
                        fetchTransactions(this.state.year, getDoubleDigitFormat(monthNames.indexOf(this.state.month) + 1))
                        .then((response) => {
                            this.setState({
                                allYear: false,
                                categories: response.categories,
                                monthTransactions: response.transactions,
                                displayTransactions: response.VISIBLE_TXNS,
                                IS_LOADING: false
                            }, () => {
                                var filteredTxns = filterTransactions(this.state.year, getDoubleDigitFormat(monthNames.indexOf(this.state.month) + 1), this.state.category, this.state.monthTransactions);
                                this.setState({ displayTransactions: filteredTxns });
                            });
                        })
                        .catch(function (response) {
                            console.log(response);
                        });
                    } else {
                        this.setState({
                            allYear: true,
                            IS_LOADING: false
                        });
                    }
                });
            });
    }

    /* life cycle */
    // 6
    handleChange(event) {
        var target = event.target;
        var value = target.value;
        var name = target.name;
        if (name === "month") {
            this.setState({ 
                [name]: value,
                monthNum: nums[value] 
            }, () => {
                this.fetchTransactions();
            });
        } else {
            this.setState({ [name]: value }, () => {
                this.fetchTransactions();
            });    
        }
           
    }

    // 2
    componentDidMount() {
        checkIfPremiumUser()
            .then((response) => {
                this.setState({ 
                    IS_PREMIUM_USER: response.isPremiumUser, 
                    email: response.email
                });
            })
            .catch(function (response) {
                console.log(response);
            });
        this.fetchTransactions()
    }

    /* render / ui */
    // 48
    renderMain() {
        let header = ['category', 'amount', this.state.allYear ? 'average (' + this.state.year + ')' : 'average (' + this.state.monthNum + '/' + this.state.year + ')'];
        const categoryHeader = header.map((key, index) => {
            return <th key={index}>{key.toUpperCase()}</th>
        })

        if (this.state.IS_LOADING) {
            return (
                <div className="indent">
                    <h4>Loading...</h4>
                </div>
            )
        } else if (!this.state.IS_LOADING && this.state.monthTransactions.length === 0) {
            return (
                <div className="indent">
                    <h4>You haven't added any transactions for the month of <b>{this.state.month}</b> yet.</h4>
                    <h4>Select <b>'Add Transaction'</b> from the menu to add some!</h4>
                </div>
            )
        } else {
            return (
                <div className="row">
                    <div className="column1" >
                        <div className="ccBillBox">
                        <h5>Category Summary</h5>

                            <table id='transactions' style={{ width: "100%" }}>
                                <tbody>
                                    <tr>{categoryHeader}</tr>
                                    {this.renderCategoryTableData()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="column2">
                        <div>
                    <h4><b>Transactions for: {this.state.email}</b></h4>
                            {renderDisplayTransactions(this.state.displayTransactions, this.state.IS_PREMIUM_USER, this.deleteTransactionButton, this.updateTransaction, this.duplicateTransaction, false, true)}
                        </div>
                    </div>
                </div>
            )
        }
    }

    // 21
    getAllYearAverages(map) {
        var yearAvgMap = {}
        for (const month in map[this.state.year]) {
            for (const cat in map[this.state.year][month]) {
                if (yearAvgMap[cat] === undefined) {
                    yearAvgMap[cat] = {
                        sum: 0.0,
                        count: 0
                    }
                }
                yearAvgMap[cat].count += 1; // (1 = 1 month) Aggregate by month so that you get avg per month, not avg per transaction.
                yearAvgMap[cat].sum += map[this.state.year][month][cat].sum;
            }
        }
        return yearAvgMap
    }
    renderCategoryTableData() {
        if (this.state.allYear) {
            var allCategoryArray = [];
            var yearAvgSpendingMap = this.getAllYearAverages(this.state.avgSpendingMap);
            Object.keys(yearAvgSpendingMap).forEach(category => {
                allCategoryArray.push({ category: category, amount: yearAvgSpendingMap[category].sum });
            });
    
            return allCategoryArray
                .sort((a, b) => {
                    return (a.category > b.category) ? 1 : -1;
                }).map((catVal, index) => {
                    const color = catVal.category.indexOf('income') !== 0 ? "black" : "green";
                    const avgSpending = yearAvgSpendingMap[catVal.category].sum / yearAvgSpendingMap[catVal.category].count;    
                    const nametd = catVal.category.includes('-') ? <td><font color={color}><i>- {catVal.category}</i></font></td> : <td><font color={color}><b>{catVal.category}</b></font></td>;
                    return (
                        <tr key={index}>
                            {nametd}
                            <td><font color='black'>${parseFloat(catVal.amount).toFixed(2)}</font></td>
                            <td><font color='black'>${parseFloat(avgSpending).toFixed(2)}</font></td>
                        </tr>
                    );
                })
        } else {
            var categoryArray = [];
            var categoryAggMap = aggregateTransactions(this.state.displayTransactions);
            Object.keys(categoryAggMap).forEach(category => {
                categoryArray.push({ category: category, amount: categoryAggMap[category] });
            });
            if (this.state.avgSpendingMap[this.state.year] !== undefined && this.state.avgSpendingMap[this.state.year][this.state.monthNum]) {
                return categoryArray
                .sort((a, b) => {
                    return (a.category > b.category) ? 1 : -1;
                }).map((catVal, index) => {
                    const color = catVal.category.indexOf('income') !== 0 ? "black" : "green";
                    const avgSpending = this.state.avgSpendingMap ? (this.state.avgSpendingMap[this.state.year][this.state.monthNum][catVal.category] !== undefined ? (this.state.avgSpendingMap[this.state.year][this.state.monthNum][catVal.category].sum / this.state.avgSpendingMap[this.state.year][this.state.monthNum][catVal.category].count) : 'no data') : 'no data';
                    const avgSpendingVal = this.state.avgSpendingMap ? (this.state.avgSpendingMap[this.state.year][this.state.monthNum][catVal.category] !== undefined ? `$${parseFloat(avgSpending).toFixed(2)}` : avgSpending) : 'no data'
                    const nametd = catVal.category.includes('-') ? <td><font color={color}><i>- {catVal.category}</i></font></td> : <td><font color={color}><b>{catVal.category}</b></font></td>;
                    return (
                        <tr key={index}>
                            {nametd}
                            <td><font color='black'>${parseFloat(catVal.amount).toFixed(2)}</font></td>
                            <td><font color='black'>{avgSpendingVal}</font></td>
                        </tr>
                    );
                })
            }
        }
    }

    // 21
    renderCategoryDropdown() {
        var catOptions = [<option key="ALL" value="ALL">{"ALL"}</option>];
        var cpArr = this.state.categories;
        cpArr.sort((a, b) => {
            return (a > b) ? 1 : -1;
        });

        var primaryCategories = []
        for (var cat of cpArr) {
            catOptions.push(<option key={cat} value={cat}>{cat}</option>)

            if (cat.split('-').length > 1) {
                const primaryCategory = cat.split('-')[0];
                if (!primaryCategories.includes(primaryCategory)) {
                    catOptions.push(<option key={primaryCategory} value={primaryCategory}>{primaryCategory}</option>);
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
            yearOptions.push(<option key={year.toString()} value={year.toString()}>{year}</option>)
        }
        return (yearOptions);
    }

    // 4
    renderMonthDropdown() {
        var monthOptions = [<option key="ALL" value="ALL">{"ALL"}</option>];

        for (var monthIdx = 0; monthIdx < monthNames.length; monthIdx += 1) {
            monthOptions.push(<option key={monthNames[monthIdx]} value={monthNames[monthIdx]}>{monthNames[monthIdx]}</option>)
        }
        return (monthOptions);
    }

    getMonthlyCCSpending() {
        var data = {};
        if (this.state.IS_LOADING === false) {
            for (const ob of this.state.ccSumData) {
                data[`${ob.year}-${ob.month}-01`] = ob.ccSum;
            }
        }
        return data;
    }
    // 39
    render() {
        return (
            <div>
                <div className="filtersInput">

                    <div className="barStack">
                        <label>
                            <b>Year:</b><br />
                            <select name="year" value={this.state.year} onChange={this.handleChange}>
                                {this.renderYearDropdown()}
                            </select>
                        </label>
                    </div>

                    <div className="barStack">
                        <label>
                            <b>Month:</b><br />
                            <select name="month" value={this.state.month} onChange={this.handleChange}>
                                {this.renderMonthDropdown()}
                            </select>
                        </label>
                    </div>

                    <div className="barStack">
                        <label>
                            <b>Category:</b><br />
                            <select name="category" value={this.state.category} onChange={this.handleChange}>
                                {this.renderCategoryDropdown()}
                            </select>
                        </label>
                    </div>
                    <br clear="all" />

                </div>

                <div>
                <h4><b>Monthly Credit Card Spending</b></h4>
                    <LineChart round={2} zeros={true} thousands="," prefix="$" colors={["#EE837F"]} data={this.getMonthlyCCSpending()} />
                </div>
                <div className="fl">
                    {this.renderMain()}
                </div>
            </div>
        );
    }
}

export default Transactions;
