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

    renderTableHeader() {
        let header = ['title', 'amount', 'date', 'category', 'type', 'payment_method', 'description'];
        return header.map((key, index) => {
            return <th key={index}>{key.toUpperCase()}</th>
        })
    }

    renderTableData() {
        return this.state.transactions.map((transaction, index) => {
            const { id, title, amount, category, date, type, payment_method, description} = transaction
            return (
                <tr key={id}>
                    <td>{title}</td>
                    <td>{amount}</td>
                    <td>{date.split('-')[0]}-{date.split('-')[1]}-{date.split('-')[2].split('T')[0]}</td>
                    <td>{category}</td>
                    <td>{type === 2 ? "Expense" : "Income"}</td>
                    <td>{payment_method}</td>
                    <td>{description}</td>
                </tr>
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
                <table id='transactions' style={{ height: '100%', width: '100%' }}>
                    <tbody>
                        <tr>{this.renderTableHeader()}</tr>
                        {this.renderTableData()}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default Transactions;
