// GraphQl Mutations
import API, { graphqlOperation } from '@aws-amplify/api';
import awsconfig from '../aws-exports';

// GraphQl Mutations
import { createPremiumUsers } from '../graphql/mutations';
import { updatePremiumUsers } from '../graphql/mutations';
import { deletePremiumUsers } from '../graphql/mutations';


API.configure(awsconfig);

export async function deletePremiumUserWithId(id) {
    // TODO
    var response = {};
    return response;
}

export async function addPremiumUser(premiumUser) {
    // TODO
    var response = {}
    return response;
}

export async function updatePremiumUserWithId(id, updatedPremiumUser) {
    // TODO
    var response = {}
    return response;
}