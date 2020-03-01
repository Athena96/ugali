// React
import React, { useEffect, useReducer } from 'react';

// Amplify
import API, { graphqlOperation } from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from './aws-exports';
import { Auth } from 'aws-amplify';

// graphql
import { listTransactions } from './graphql/queries';

// Components
import App from "./App.js";

API.configure(awsconfig);
PubSub.configure(awsconfig);

// Constants
const TXN_LIMIT = 100;

const QUERY = 'QUERY';

// State
const initialState = {
    transactions: []
};

// todo stop using this confusing reducer stuff, use "setState()" instead
const reducer = (state, action) => {
    switch (action.type) {
        case QUERY:
            console.log(App.glob);
            console.log("QUERY, ", action);
            return { ...state, transactions: action.transactions};
        default:
            return state;
    }
}

function Transactions() {

    const [state, dispatch] = useReducer(reducer, initialState);

    function renderTableHeader() {
        let header = ['title', 'amount', 'date', 'category', 'type', 'payment_method', 'description'];
        return header.map((key, index) => {
            return <th key={index}>{key.toUpperCase()}</th>
        })
    }

    function renderTableData() {
        return state.transactions.map((transaction, index) => {
            const { id, title, amount, category, date, type, payment_method, description} = transaction
            return (
                <tr key={id}>
                    <td>{title}</td>
                    <td>{amount}</td>
                    <td>{category}</td>
                    <td>{date.split('-')[0]}-{date.split('-')[1]}-{date.split('-')[2].split('T')[0]}</td>
                    <td>{type === 2 ? "Expense" : "Income"}</td>
                    <td>{payment_method}</td>
                    <td>{description}</td>
                </tr>
            )
        })
    }

    useEffect(() => {

        async function getData() {

            let user = await Auth.currentAuthenticatedUser();
            let email = user.attributes.email;
            console.log("Fetching transactions for: " + email);
            const transactionData = await API.graphql(graphqlOperation(listTransactions, { limit: TXN_LIMIT, filter: { user: { eq: email } } }));

            var sortedTxns = transactionData.data.listTransactions.items;
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

            dispatch({ type: QUERY, transactions: sortedTxns });
        }
        getData();

    }, []);

    return (
        <div className="App">
            <br />
            <div>
                <table id='transactions'>
                    <tbody>
                        <tr>{renderTableHeader()}</tr>
                        {renderTableData()}
                    </tbody>
                </table>
            </div>
        </div>
    );
}


export default Transactions;