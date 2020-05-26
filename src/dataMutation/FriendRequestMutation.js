// GraphQl Mutations
import API, { graphqlOperation } from '@aws-amplify/api';
import awsconfig from '../aws-exports';

// GraphQl Mutations
import { createFriendRequest, updateFriendRequest, deleteFriendRequest} from '../graphql/mutations';
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
    if (user.attributes.email === newFriend) return {addedMyself: true};
    var isPremiumCheck = await checkIfPremiumUserForUser(newFriend);

    console.log("adding: ", newFriend);
    console.log(isPremiumCheck);
    if (isPremiumCheck.isPremiumUser && !isPremiumCheck.subscriptionExpired) {
        const today = new Date();
        var dateAdded = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours());
    
        const friendRequest = {
            from: user.attributes.email,
            to: newFriend,
            createdAt: graphqlDateFromJSDate(dateAdded)
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

export async function updateFriendRequestWithId(updatedFriendRequest) {
    var response = await API.graphql(graphqlOperation(updateFriendRequest, { input: updatedFriendRequest }));
    return response;
}

