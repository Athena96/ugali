import { Auth } from 'aws-amplify';
import API, { graphqlOperation } from '@aws-amplify/api';
import { listFriendRequests } from '../graphql/queries';

// Constants
const FRIENDS_LIMIT = 100;

export async function fetchFriendRequests() {
    var user = await Auth.currentAuthenticatedUser();
    var toMe = await API.graphql(graphqlOperation(listFriendRequests, {
        limit: FRIENDS_LIMIT,
        filter: { to: { eq: user.attributes.email } }
    }));

    var fromMe = await API.graphql(graphqlOperation(listFriendRequests, {
        limit: FRIENDS_LIMIT,
        filter: { from: { eq: user.attributes.email } }
    }));

    var response = {};

    var friendRequestsList = [];
    for (var f of toMe.data.listFriendRequests.items) {
        friendRequestsList.push(f);
    }
    for (var ff of fromMe.data.listFriendRequests.items) {
        friendRequestsList.push(ff);
    }

    response.friendRequests = friendRequestsList;
    return response;
}