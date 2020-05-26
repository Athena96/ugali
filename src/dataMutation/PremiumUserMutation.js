// GraphQl Mutations
import API, { graphqlOperation } from '@aws-amplify/api';
import awsconfig from '../aws-exports';

// GraphQl Mutations
import { createPremiumUsers, updatePremiumUsers, deletePremiumUsers } from '../graphql/mutations';

API.configure(awsconfig);

export async function deletePremiumUserWithId(id) {
    var response = await API.graphql(graphqlOperation(deletePremiumUsers, { input: { id: id } }));
    return response;
}

export async function addPremiumUser(premiumUser) {
    var response = await API.graphql(graphqlOperation(createPremiumUsers, { input: premiumUser }));
    return response;
}

export async function updatePremiumUserWithId(updatedPremiumUser) {
    var response = await API.graphql(graphqlOperation(updatePremiumUsers, { input: updatedPremiumUser }));
    return response;
}