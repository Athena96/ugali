// GraphQl Mutations
import API, { graphqlOperation } from '@aws-amplify/api';
import awsconfig from '../aws-exports';

// GraphQl Mutations
import { createFriend, deleteFriendRequest } from '../graphql/mutations';
import { updateFriend } from '../graphql/mutations';
import { deleteFriend } from '../graphql/mutations';
import { Auth } from 'aws-amplify';

import { graphqlDateFromJSDate } from '../common/Utilities';
import { checkIfPremiumUserForUser } from '../dataAccess/PremiumUserAccess';
import { deleteFriendRequestWithId } from './FriendRequestMutation';

API.configure(awsconfig);

export async function deleteFriendWithId(id) {
    var response = await API.graphql(graphqlOperation(deleteFriend, { input: { id: id } }))
    return response;
}

export async function addFriend(friendReq) {
    var user = await Auth.currentAuthenticatedUser();
    if (user.attributes.email === friendReq.email) return;

    var isPremiumCheck = await checkIfPremiumUserForUser(friendReq.email);    
    if (isPremiumCheck.isPremiumUser && !isPremiumCheck.subscriptionExpired) {
        const today = new Date();
        var dateAdded = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours());
    
        const friend = {
            from: friendReq.email,
            to: user.attributes.email,
            createdAt: graphqlDateFromJSDate(dateAdded)
        }
        var response = await API.graphql(graphqlOperation(createFriend, { input: friend }));
        await API.graphql(graphqlOperation(deleteFriendRequest, { input: { id: friendReq.id } }))

        response.addedFriend = friendReq.email;
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