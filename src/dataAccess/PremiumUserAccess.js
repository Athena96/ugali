import { Auth } from 'aws-amplify';
import API, { graphqlOperation } from '@aws-amplify/api';
import { listPremiumUserss } from '../graphql/queries';

// Constants
const PREMIUM_USER_LIMIT = 200;

export async function checkIfPremiumUser() {
    var user = await Auth.currentAuthenticatedUser();
    var data = await API.graphql(graphqlOperation(listPremiumUserss, {
        limit: PREMIUM_USER_LIMIT,
        filter: { user: { eq: user.attributes.email } }
    }));

    const premiumUsers = data.data.listPremiumUserss.items;
    var response = {};
    response.email = user.attributes.email;

    if (premiumUsers.length === 0) {
        response.isPremiumUser = false;
        response.subscriptionExpired = true;
    } else {
        response.premiumUser = premiumUsers[0];
        const today = new Date();
        const expDate = new Date(premiumUsers[0].expiryDate);
        if (today < expDate) {
            response.isPremiumUser = true;
            response.subscriptionExpired = false;
        } else {
            response.isPremiumUser = true;
            response.subscriptionExpired = true;
        }
    }

    return response;
}