import { Auth } from 'aws-amplify';

const config = require('../config.json');
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = config.region;

var ddb = new AWS.DynamoDB.DocumentClient();

export async function getAvgSpendingMapForUser() {
    try {
        var user = await Auth.currentAuthenticatedUser();
        console.log("HERE: ",user);
        var params = {
            TableName: config.spendingAggregatorTableName,
            Key: {
                "user": user.attributes.email
            }
        };
        const result = await ddb.get(params).promise();
        return result.Item.avgSpendingData;
    } catch (err) {
        console.log("ERROR FETCHING");
        console.error(err);
    }
}