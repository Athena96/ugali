// GraphQl Mutations
import API, { graphqlOperation } from '@aws-amplify/api';
import awsconfig from '../aws-exports';

// GraphQl Mutations
import { createFriendRequest } from '../graphql/mutations';
import { updateFriendRequest } from '../graphql/mutations';
import { deleteFriendRequest } from '../graphql/mutations';
import { Auth } from 'aws-amplify';

import { graphqlDateFromJSDate } from '../common/Utilities';
import { checkIfPremiumUserForUser } from '../dataAccess/PremiumUserAccess';

API.configure(awsconfig);

export async function deleteFriendRequestWithId(id) {
    var response = await API.graphql(graphqlOperation(deleteFriendRequest, { input: { id: id } }))
    return response;
}

export async function addFriendRequest(newFriend) {
    var user = await Auth.currentAuthenticatedUser();
    if (user.attributes.email === newFriend) return;
    var isPremiumCheck = await checkIfPremiumUserForUser(newFriend);

    console.log("adding: ", newFriend);
    console.log(isPremiumCheck);
    if (isPremiumCheck.isPremiumUser && !isPremiumCheck.subscriptionExpired) {
        const today = new Date();
        var expDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    
        const friendRequest = {
            from: user.attributes.email,
            to: newFriend,
            createdAt: graphqlDateFromJSDate(expDate)
        }
        var response = await API.graphql(graphqlOperation(createFriendRequest, { input: friendRequest }));
        response.newFriend = newFriend;
        response.friendIsPremium = true;
        return response;
    } else {
        var response = {};
        response.friendIsPremium = false;
        return response;
    }

}

export async function updateFriendWithId(id, updatedFriend) {
    // TODO
    var response = {}
    return response;
}