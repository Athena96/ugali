// GraphQl Mutations
import API, { graphqlOperation } from '@aws-amplify/api';
import awsconfig from '../aws-exports';

// GraphQl Mutations
import { createFriend } from '../graphql/mutations';
import { updateFriend } from '../graphql/mutations';
import { deleteFriend } from '../graphql/mutations';
import { Auth } from 'aws-amplify';

import { graphqlDateFromJSDate } from '../common/Utilities';
import { checkIfPremiumUserForUser } from '../dataAccess/PremiumUserAccess';

API.configure(awsconfig);

export async function deleteFriendWithId(id) {
    var response = await API.graphql(graphqlOperation(deleteFriend, { input: { id: id } }))
    return response;
}

export async function addFriend(friendEmail) {
    var user = await Auth.currentAuthenticatedUser();
    var isPremiumCheck = await checkIfPremiumUserForUser(friendEmail);

    console.log("adding: ", friendEmail);
    console.log(isPremiumCheck);
    if (isPremiumCheck.isPremiumUser && !isPremiumCheck.subscriptionExpired) {
        const today = new Date();
        var expDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    
        const friend = {
            me: user.attributes.email,
            myFriend: friendEmail,
            createdAt: graphqlDateFromJSDate(expDate)
        }
        var response = await API.graphql(graphqlOperation(createFriend, { input: friend }));
        response.addedFriend = friendEmail;
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