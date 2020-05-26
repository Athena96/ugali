// GraphQl Mutations
import API, { graphqlOperation } from '@aws-amplify/api';
import awsconfig from '../aws-exports';

// GraphQl Mutations
import { createTransaction, updateTransaction, deleteTransaction} from '../graphql/mutations';

API.configure(awsconfig);

export async function deleteTransactionWithId(id) {
    var response = await API.graphql(graphqlOperation(deleteTransaction, { input: { id: id } }))
    return response;
}

export async function addTransaction(transaction) {
    var response = await API.graphql(graphqlOperation(createTransaction, { input: transaction }));
    return response;
}

export async function updateTransactionWithId(updatedTransaction) {
    var response = await API.graphql(graphqlOperation(updateTransaction, { input: updatedTransaction }));
    return response;
}