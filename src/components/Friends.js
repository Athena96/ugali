// React
import React, { Component } from 'react';

// Amplify
import API, { graphqlOperation } from '@aws-amplify/api';
import PubSub from '@aws-amplify/pubsub';
import awsconfig from '../aws-exports';
import { Auth } from 'aws-amplify';

// GraphQl Mutations
import { addFriend, deleteFriendWithId } from '../dataMutation/FriendMutation';
import { addFriendRequest, deleteFriendRequestWithId } from '../dataMutation/FriendRequestMutation';

// Data Access
import { fetchPublicTransactionsByUser } from '../dataAccess/TransactionAccess';
import { fetchFollowing, fetchFollowers } from '../dataAccess/FriendsAccess';
import { fetchFriendRequests } from '../dataAccess/FriendRequestAccess';
import { checkIfPremiumUser } from '../dataAccess/PremiumUserAccess';
import { getDisplayTransactionsNoFunctions } from '../common/Utilities';

API.configure(awsconfig);
PubSub.configure(awsconfig);

class Friends extends Component {
    constructor(props) {
        super(props);
        this.shownRecorded = {};
        this.state = {
            user: "",
            isPremiumUser: false,
            subscriptionExpired: true,
            premiumUsers: {},
            IS_LOADING: true,
            friendsTransactions: [],
            friends: [],
            followers: [],
            addFriendEmail: "",
            friendRequests: []
        };
        this.handleChange = this.handleChange.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.requestFriendButton = this.requestFriendButton.bind(this);
        this.deleteFriendButton = this.deleteFriendButton.bind(this);
        this.deleteFriendRequestButton = this.deleteFriendRequestButton.bind(this);
        this.acceptFriendRequestButton = this.acceptFriendRequestButton.bind(this);
    }

    refreshPage() {
        window.location.reload(false);
    }

    async loadFriendsAndTimeline() {
        this.setState({ IS_LOADING: true });
        const premRes = await checkIfPremiumUser();

        this.setState({ isPremiumUser: premRes.isPremiumUser });
        this.setState({ subscriptionExpired: premRes.subscriptionExpired });

        if (!premRes.isPremiumUser || premRes.subscriptionExpired) {
            this.props.history.push('/premium/');
        }

        this.setState({ premiumUser: premRes.premiumUser });
        this.setState({ IS_LOADING: false });


        const friendRequestResponse = await fetchFriendRequests();
        this.setState({ friendRequests: friendRequestResponse.friendRequests });

        // for each friend ...
        const response = await fetchFollowing();
        this.setState({ friends: response.friends });

        const responseFollowers = await fetchFollowers();
        console.log(responseFollowers);
        this.setState({ followers: responseFollowers.followers });

        var today = new Date();
        var startDate = (new Date()).setDate(today.getDate() - 30);
        var friendsTxnList = [];
        for (const f of response.friends) {
            const res = await fetchPublicTransactionsByUser(startDate, today, f.to);
            for (const t of res.friends_transactions) {
                friendsTxnList.push(t);
            }
        }

        var sortedTxns = friendsTxnList;

        sortedTxns.sort((t1, t2) => {
            var d1 = new Date(t1.date);
            var d2 = new Date(t2.date);
            if (d1 < d2)
                return 1;
            if (d1 > d2)
                return -1;
            return 0;
        });

        this.setState({ friendsTransactions: sortedTxns });
        this.setState({ IS_LOADING: false });
    }

    // life cycle
    componentDidMount() {
        this.loadFriendsAndTimeline();
    }

    requestFriendButton() {
        addFriendRequest(this.state.addFriendEmail.toLocaleLowerCase()).then((response) => {
            if (response.friendIsPremium) {
                window.alert("Successfully sent your friend request to '" + response.newFriend + "' !");
                this.refreshPage();
            } else if (response.addedMyself) {
                window.alert("Error. You cannot follow yourself, no matter how cool you are.");
            } else {
                window.alert("Sorry, we couldn't add this user as your friend because they are not a Premium Subscriber.");
            }
        })
    }

    acceptFriendRequestButton(event) {
        const friendReq = event.target.id;
        const req = { email: friendReq.split("_")[0], id: friendReq.split("_")[1] };

        console.log(friendReq);
        addFriend(req).then( (response) => {
            if (response.friendIsPremium) {
                window.alert("Successfully added your friend '" + response.addedFriend + "' !");
                this.refreshPage();
            } else {
                window.alert("Sorry, we couldn't add this user as your friend because they are not a Premium Subscriber.");
            }
        })
    }

    deleteFriendButton(event) {
        const idOfDeleteFriend = event.target.id;
        deleteFriendWithId(idOfDeleteFriend).then((response) => {
            window.alert("Successfully deleted your friend!");
            var newFriends = [];
            for (var friend of this.state.friends) {
                if (friend.id !== idOfDeleteFriend) {
                    newFriends.push(friend);
                }
            }

            this.setState({
                friends: newFriends,
            });

            this.refreshPage();

        })
    }

    deleteFriendRequestButton(event) {
        const idOfDeleteFriendRequest = event.target.id;
        deleteFriendRequestWithId(idOfDeleteFriendRequest).then((response) => {
            window.alert("Successfully deleted your friend request!");
            var newFriendRequests = [];
            for (var friendRequest of this.state.friendRequests) {
                if (friendRequest.id !== idOfDeleteFriendRequest) {
                    newFriendRequests.push(friendRequest);
                }
            }

            this.setState({
                friendRequests: newFriendRequests,
            });
        })
    }

    handleChange(event) {
        var target = event.target;
        var value = target.value;
        var name = target.name;

        this.setState({
            [name]: value
        });
    }

    renderAddFriends() {
        return (
            <div>
                <label>
                    <input
                        className="addFriendInput"
                        placeholder="friend email"
                        name="addFriendEmail"
                        type="text"
                        value={this.state.addFriendEmail}
                        onChange={this.handleChange} />
                </label> <button className="addFriendButton" onClick={this.requestFriendButton} >send follow request</button>

            </div>
        );
    }

    renderFriendRequests() {
        var friendRequests = [];
        var displayDate;
        var currDay = ""
        for (var friendRequest of this.state.friendRequests) {
            const { id, from, to, createdAt } = friendRequest;
            var classname = "friendsListEntry";
            const dayIdx = new Date(createdAt);
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            var dayOfWeek = days[dayIdx.getDay()];

            currDay = createdAt.split('-')[0] - createdAt.split('-')[1] - createdAt.split('-')[2].split('T')[0] + " " + dayOfWeek;
            displayDate = <h5><b>{createdAt.split('-')[0]}-{createdAt.split('-')[1]}-{createdAt.split('-')[2].split('T')[0]} {dayOfWeek}</b></h5>;

            const friendIq =  from + "_" + id;

            if (from !== this.state.premiumUser.user) {
                friendRequests.push(
                    <div>
                        <div className={classname}>
                            <font size="4.5">{from}<br /></font>
                            <font size="4.5">requested on <b>{createdAt.split('-')[0]}-{createdAt.split('-')[1]}-{createdAt.split('-')[2].split('T')[0]} {dayOfWeek}</b></font><br />
                            <button id={id} className="deleteFriendButton" onClick={this.deleteFriendRequestButton} >ignore</button>
                            <button id={friendIq} className="addFriendButton" onClick={this.acceptFriendRequestButton} >accept</button>
    
                        </div>
                    </div>
                );
            } else {
                friendRequests.push(
                    <div>
                        <div className={classname}>
                            <font size="4.5"><b>from me to</b>: {to}<br /></font>
                            <font size="4.5">requested on <b>{createdAt.split('-')[0]}-{createdAt.split('-')[1]}-{createdAt.split('-')[2].split('T')[0]} {dayOfWeek}</b></font><br />
                            <button id={id} className="deleteFriendButton" onClick={this.deleteFriendRequestButton} >delete</button>    
                        </div>
                    </div>
                );
            }

        }

        return friendRequests;
    }

    renderFollowers() {
        if (this.state.followers.length === 0) {
            return (

                <p>You don't have any followers yet</p>
            );
        }
        var friends = [];
        var displayDate;
        var currDay = ""
        for (var follower of this.state.followers) {
            const { id, from, to, createdAt } = follower;
            var classname = "friendsListEntry";
            const dayIdx = new Date(createdAt);
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            var dayOfWeek = days[dayIdx.getDay()];

            currDay = createdAt.split('-')[0] - createdAt.split('-')[1] - createdAt.split('-')[2].split('T')[0] + " " + dayOfWeek;
            displayDate = <h5><b>{createdAt.split('-')[0]}-{createdAt.split('-')[1]}-{createdAt.split('-')[2].split('T')[0]} {dayOfWeek}</b></h5>;

            friends.push(
                <div>
                    <div className={classname}>
                        <font size="4.5">{from}<br /></font>
                        <font size="4.5">added on <b>{createdAt.split('-')[0]}-{createdAt.split('-')[1]}-{createdAt.split('-')[2].split('T')[0]} {dayOfWeek}</b></font><br />
                        <button id={id} className="deleteFriendButton" onClick={this.deleteFriendButton} >remove</button>
                    </div>
                </div>
            );
        }

        return friends;
    }

    renderFollowing() {
        if (this.state.friends.length === 0) {
            return (

                <p>You're not following anyone yet, send a follow request!</p>
            );
        }
        var friends = [];
        var displayDate;
        var currDay = ""
        for (var following of this.state.friends) {
            const { id, from, to, createdAt } = following;
            var classname = "friendsListEntry";
            const dayIdx = new Date(createdAt);
            console.log("createdAt: ", createdAt)
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            var dayOfWeek = days[dayIdx.getDay()];

            currDay = createdAt.split('-')[0] - createdAt.split('-')[1] - createdAt.split('-')[2].split('T')[0] + " " + dayOfWeek;
            displayDate = <h5><b>{createdAt.split('-')[0]}-{createdAt.split('-')[1]}-{createdAt.split('-')[2].split('T')[0]} {dayOfWeek}</b></h5>;

            friends.push(
                <div>
                    <div className={classname}>
                        <font size="4.5">{to}<br /></font>
                        <font size="4.5">added on <b>{createdAt.split('-')[0]}-{createdAt.split('-')[1]}-{createdAt.split('-')[2].split('T')[0]} {dayOfWeek}</b></font><br />
                        <button id={id} className="deleteFriendButton" onClick={this.deleteFriendButton} >remove</button>
                    </div>
                </div>
            );
        }

        return friends;
    }

    renderTimelineTransactions() {
        return (
            getDisplayTransactionsNoFunctions(this.state.friendsTransactions, this.state.isPremiumUser, true) 
       );
    }

    renderFriendsPage() {
        return (
            <div class="inset" >
                <div  >
                    <h4><b>Add Friend</b></h4>
                    {this.renderAddFriends()}
                </div>
                <div>
                {this.state.friendRequests.length === 0 ? <></> : <><h4><b>Requests</b></h4>{this.renderFriendRequests()}</>}
                </div>
                <div  >
                    <h4><b>Followers</b></h4>
                    {this.renderFollowers()}
                </div>
                <div  >
                    <h4><b>Following</b></h4>
                    {this.renderFollowing()}
                </div>
                <div >
                    <h4><b>Transaction Timeline</b><br/><small>(your friends' public transactions)</small></h4>
                    {this.renderTimelineTransactions()}
                </div>
            </div>
        );
    }

    render() {
        if (this.state.IS_LOADING) {
            return (
                <div class="indent">
                    <h4>Loading...</h4>
                </div>
            );
        } else {
            return (
                this.renderFriendsPage()
            );
        }
    }
}

export default Friends;
