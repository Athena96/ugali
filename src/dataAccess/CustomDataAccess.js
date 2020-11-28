import { Auth } from 'aws-amplify';

const config = require('../config.json');
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = config.region;
AWS.config.accessKeyId = 'AKIASQ7R57SO5EEXD6C6'; //process.env.REACT_APP_ACCESS_KEY;
AWS.config.secretAccessKey = '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'; // process.env.REACT_APP_SEC_ACCESS_KEY;

var ddb = new AWS.DynamoDB.DocumentClient();

export async function getAvgSpendingMapForUser() {
    try {
        var user = await Auth.currentAuthenticatedUser();
        var params = {
            TableName: config.stage === 'prod' ? config.spendingAggregatorTableName : config.spendingAggregatorTableDev,
            Key: {
                "user": user.attributes.email
            }
        };
        const result = await ddb.get(params).promise();
        if (result && result.Item && result.Item.avgSpendingData) {
            return result.Item.avgSpendingData;
        } else {
            return null;
        }
    } catch (err) {
        console.error(err);
        return {categoryMap: {}};
    }
}