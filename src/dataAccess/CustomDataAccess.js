import { Auth } from 'aws-amplify';

const config = require('../config.json');
var AWS = require('aws-sdk');
AWS.config = new AWS.Config();
AWS.config.region = config.region;
AWS.config.accessKeyId = process.env.REACT_APP_ACCESS_KEY;
AWS.config.secretAccessKey = process.env.REACT_APP_SEC_ACCESS_KEY;

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
        return { categoryMap: {} };
    }
}

async function getSelectedSimulationId() {
    try {
        const params = {
            TableName: config.stage === 'prod' ? config.simulationTableNameProd : config.simulationTableNameDev,
            Limit: 100
        };
        const result = await ddb.scan(params).promise();
        if (result && result.Items) {
            for (const item of result.Items) {
                console.log('->' + JSON.stringify(item));
                if (item.selected) {
                    return item.id;
                }
            }
        } else {
            return null;
        }
    } catch (err) {
        console.error(err);
        return null;
    }
}

function getCurrentBudget(budgets, date) {
    date.setHours(0, 0, 0);
    for (const budget of budgets) {
        const budgetStartDate = new Date(budget.startDate).setHours(0, 0, 0)
        const budgetEndDate = new Date(budget.endDate).setHours(0, 0, 0)
        if (date >= new Date(budgetStartDate) && date <= budgetEndDate) {
            return budget;
        }
    }
}

export async function getBudgetData(viewMonth, viewYear) {
    try {
        const selectedSimId = await getSelectedSimulationId();
        const budgets = await ddb.query({
            TableName: config.stage === 'prod' ? config.budgetTableNameProd : config.budgetTableNameDev,
            IndexName: "budgetsBySimulationId",
            KeyConditionExpression: 'simulation = :sim_id',
            ExpressionAttributeValues: { ':sim_id': selectedSimId }
        }).promise();
        const date = new Date(viewYear, viewMonth, 1)
        return getCurrentBudget(budgets.Items, date);
    } catch (err) {
        console.error(err);
        return { categoryMap: {} };
    }
}