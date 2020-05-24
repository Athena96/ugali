import { Auth } from 'aws-amplify';
import API, { graphqlOperation } from '@aws-amplify/api';
import { listFriends } from '../graphql/queries';

// Constants
const FRIENDS_LIMIT = 100;

export async function fetchFriends() {
    var user = await Auth.currentAuthenticatedUser();
    var data = await API.graphql(graphqlOperation(listFriends, {
        limit: FRIENDS_LIMIT,
        filter: { me: { eq: user.attributes.email } }
    }));

    var response = {};

    var friendsList = [];
    for (var f of data.data.listFriends.items) {
        console.log(f);
        friendsList.push(f);
    }

    response.friends = friendsList;
    return response;
}