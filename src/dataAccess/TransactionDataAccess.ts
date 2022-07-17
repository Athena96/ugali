import { API, graphqlOperation } from "aws-amplify";
import { GetTransactionQuery, TransactionsByUserDateQuery } from "../API";
import { getTransaction, transactionsByUserDate } from "../graphql/queries";
import { Transaction } from "../model/Transaction";
import { mapDDBItemToTransaction, mapTransactionToDDBItem } from "../mappers/TransactionMapper";
import { createTransaction, deleteTransaction, updateTransaction } from "../graphql/mutations";
import { getDoubleDigitFormat } from "../utilities/helpers";



export async function deleteTransactionDB(transactionId: string) {
    try {
        await API.graphql(graphqlOperation(deleteTransaction, { input: { id: transactionId }} ))
    } catch (err) {
        console.error('error deleting transaction:', err)
    }
}

export async function getTransactionDB(transactionId: string, user: String) {
    try {
        const res = await API.graphql(graphqlOperation(getTransaction, { id: transactionId })) as { data: GetTransactionQuery }
        const ddbTransaction = res.data.getTransaction;
        const transaction = mapDDBItemToTransaction(ddbTransaction);
        if (transaction && transaction.user === user) {
            return transaction;
        }
    } catch (err) {
        console.error('error fetching transaction:', err)
    }
}

export async function updateTransactionDB(transaction: Transaction) {
    try {
            await API.graphql(graphqlOperation(updateTransaction, { input: mapTransactionToDDBItem(transaction) }))

    } catch (err) {
        console.error('error updating transaction:', err)
    }
}

export async function createTransactionDB(transaction: Transaction) {
    try {
            await API.graphql(graphqlOperation(createTransaction, { input: mapTransactionToDDBItem(transaction) }))
    } catch (err) {
        console.error('error creating transaction:', err)
    }
}

export async function fetchTransactionsForYearMonth(user: string, year: number, month: number) {
    var lastDay = new Date(year, month, 0);
    var firstDay = new Date(year, month - 1, 1)

    var start = firstDay.getFullYear() + "-" + getDoubleDigitFormat(firstDay.getMonth() + 1) + "-" + getDoubleDigitFormat(firstDay.getDate()) + "T00:00:00.000Z"
    var end = lastDay.getFullYear() + "-" + getDoubleDigitFormat(lastDay.getMonth() + 1) + "-" + getDoubleDigitFormat(lastDay.getDate()) + "T23:59:59.000Z"


    let nxtTkn: string | null | undefined;
    let transactions: Transaction[] = []
    do {
      const response = (await API.graphql({
        query: transactionsByUserDate, variables: { user: user, date: { between: [start, end] }, nextToken: nxtTkn }, 
      })) as { data: TransactionsByUserDateQuery }

      for (const event of response.data.transactionsByUserDate?.items || []) {
        const txn = mapDDBItemToTransaction(event)
        if (txn) {
            transactions.push(txn);
        }
      }
      nxtTkn = response.data.transactionsByUserDate?.nextToken;
    } while (nxtTkn !== null);

    return transactions;
}