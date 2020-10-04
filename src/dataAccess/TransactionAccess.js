import { Auth } from 'aws-amplify';
import API, { graphqlOperation } from '@aws-amplify/api';
import { transactionsByUserDate, transactionsByUserRecurring,transactionsByUserDatePublic } from '../graphql/queries';
import { getDoubleDigitFormat, getCategoriesFromTransactions } from '../common/Utilities';
import { getTransaction } from '../graphql/queries';

// Constants
const TXN_LIMIT = 200;

export async function fetchTransactions(year, month) {
    var lastDay = new Date(year, month, 0);
    var firstDay = new Date(year, month - 1, 1)

    var start = firstDay.getFullYear() + "-" + getDoubleDigitFormat(firstDay.getMonth() + 1) + "-" + getDoubleDigitFormat(firstDay.getDate()) + "T00:00:00.000Z"
    var end = lastDay.getFullYear() + "-" + getDoubleDigitFormat(lastDay.getMonth() + 1) + "-" + getDoubleDigitFormat(lastDay.getDate()) + "T23:59:59.000Z"

    var user = await Auth.currentAuthenticatedUser();
    var data = await API.graphql(graphqlOperation(transactionsByUserDate, {
        limit: TXN_LIMIT,
        user: user.attributes.email,
        date: { between: [start, end] }
    }));

    var txns = [];
    for (var t of data.data.transactionsByUserDate.items) {
        if (t != null) {
            t.is_recurring = t.is_recurring === "true" || t.is_recurring === true ? true : false;
            txns.push(t);
        }

    }
    var sortedTxns = txns;
    sortedTxns.sort((t1, t2) => {
        var d1 = new Date(t1.date);
        var d2 = new Date(t2.date);
        if (d1 < d2)
            return 1;
        if (d1 > d2)
            return -1;
        return 0;
    });
    var response = {};
    response.categories = getCategoriesFromTransactions(sortedTxns);
    response.transactions = sortedTxns;
    response.VISIBLE_TXNS = sortedTxns;
    return response;
}

export async function fetchRecurringTransactions() {
    var user = await Auth.currentAuthenticatedUser();
    var data = await API.graphql(graphqlOperation(transactionsByUserRecurring, {
        limit: TXN_LIMIT,
        user: user.attributes.email,
        is_recurring: { eq: "true" }
    }));

    var txns = [];
    for (var t of data.data.transactionsByUserRecurring.items) {
        t.is_recurring = t.is_recurring === "true" ? true : false;
        txns.push(t);
    }
    var sortedTxns = txns;

    sortedTxns.sort((t1, t2) => {
        var d1 = new Date(t1.date);
        var d2 = new Date(t2.date);
        if (d1 < d2)
            return 1;
        if (d1 > d2)
            return -1;
        return 0;
    });

    var response = {};
    response.recurring_txns = sortedTxns;
    return response;
}

export async function fetchTransactionsForUserBetween(startDate, endDate) {
    var user = await Auth.currentAuthenticatedUser();
    var data = await API.graphql(graphqlOperation(transactionsByUserDate, {
        limit: TXN_LIMIT,
        user: user.attributes.email,
        date: { between: [startDate, endDate] }
    }));

    var categories = [];
    for (var txn of data.data.transactionsByUserDate.items) {
        if (!categories.includes(txn.category)) {
            categories.push(txn.category);
        }
    }

    var response = {};
    response.usersLatestCateogories = categories;
    return response;
}

export async function fetchTransactionBy(id) {
    var user = await Auth.currentAuthenticatedUser();
    var transactionData = await API.graphql(graphqlOperation(getTransaction, {
        id: id
    }));

    var response = {};
    if (transactionData.data.getTransaction.user !== user.attributes.email) {
        response.errorMessage = "Couldn't find the transaction.";
        return response;
    }

    response.user = user.attributes.email;
    response.transaction = transactionData.data.getTransaction;
    return response;
}