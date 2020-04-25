// GraphQl Mutations
import API, { graphqlOperation } from '@aws-amplify/api';
import awsconfig from '../aws-exports';

// GraphQl Mutations
import { createTransaction } from '../graphql/mutations';
import { updateTransaction } from '../graphql/mutations';
import { deleteTransaction } from '../graphql/mutations';


API.configure(awsconfig);

export async function deleteTransactionWithId(id) {
    var response = await API.graphql(graphqlOperation(deleteTransaction, { input: { id: id } }))
    return response;
}

export async function addTransaction(transaction) {
    // TODO
    var response = {}
    return response;
}

export async function updateTransactionWithId(id, updatedTransaction) {
    // TODO
    var response = {}
    return response;
}