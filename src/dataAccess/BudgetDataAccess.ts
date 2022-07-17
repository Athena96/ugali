import { API, graphqlOperation } from "aws-amplify";
import { BudgetsByUserDateQuery } from "../API";
import { createSpendingBudget, updateSpendingBudget } from "../graphql/mutations";
import { budgetsByUserDate } from "../graphql/queries";
import { mapBudgetToDDBItem, mapDDBItemToBudget } from "../mappers/BudgetMapper";
import { Budget } from "../model/Budget";



export async function updateBudgetDB(budget: Budget) {
    try {
        await API.graphql(graphqlOperation(updateSpendingBudget, { input: mapBudgetToDDBItem(budget) }))
    } catch (err) {
        console.error('error updating Budget:', err)
    }
}

export async function createBudgetDB(budget: Budget) {
    try {
        await API.graphql(graphqlOperation(createSpendingBudget, { input: mapBudgetToDDBItem(budget) }))
    } catch (err) {
        console.error('error creating Budget:', err)
    }
}
export async function getBudgetForUserDB(user: string) {

    let nxtTkn: string | null | undefined;

    do {

        try {
            const response = (await API.graphql({
                query: budgetsByUserDate, variables: { user: user, nextToken: nxtTkn },
            })) as { data: BudgetsByUserDateQuery }


            const ddbBudget = response.data.budgetsByUserDate?.items;

            if (ddbBudget) {

                const budget = mapDDBItemToBudget(ddbBudget[0]);
                if (budget && budget.user === user) {
                    return budget;
                }
            }
            nxtTkn = response.data.budgetsByUserDate?.nextToken;

        } catch (err) {
            console.error('error fetching Budget:', err)
        }
    } while (nxtTkn !== null);
    return undefined;
}