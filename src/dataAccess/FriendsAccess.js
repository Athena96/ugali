import { Auth } from 'aws-amplify';
import API, { graphqlOperation } from '@aws-amplify/api';
import { listFriends } from '../graphql/queries';

// Constants
const FRIENDS_LIMIT = 100;

export async function fetchFollowing() {
    var user = await Auth.currentAuthenticatedUser();
    var data = await API.graphql(graphqlOperation(listFriends, {
        limit: FRIENDS_LIMIT,
        filter: { from: { eq: user.attributes.email } }
    }));

    var response = {};

    var friendsList = [];
    for (var f of data.data.listFriends.items) {
        friendsList.push(f);
    }

    response.friends = friendsList;
    return response;
}

export async function fetchFollowers() {
    var user = await Auth.currentAuthenticatedUser();
    var data = await API.graphql(graphqlOperation(listFriends, {
        limit: FRIENDS_LIMIT,
        filter: { to: { eq: user.attributes.email } }
    }));

    var response = {};

    var friendsList = [];
    for (var f of data.data.listFriends.items) {
        
        friendsList.push(f);
    }

    response.followers = friendsList;
    return response;
}