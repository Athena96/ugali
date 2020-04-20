import { Auth } from 'aws-amplify';
import API, { graphqlOperation } from '@aws-amplify/api';
import { transactionsByUserDate } from '../graphql/queries';
import { getDoubleDigitFormat, getCategoriesFromTransactions} from '../common/Utilities';

// Constants
const TXN_LIMIT = 200;

export async function fetchTransactions(year, month, category) {
    var lastDay = new Date(year, month, 0);
    var firstDay = new Date(year, month - 1, 1)

    var start = firstDay.getFullYear() + "-" + getDoubleDigitFormat(firstDay.getMonth() + 1) + "-" + getDoubleDigitFormat(firstDay.getDate() + 1) + "T00:00:00.000Z"
    var end = lastDay.getFullYear() + "-" + getDoubleDigitFormat(lastDay.getMonth() + 1) + "-" + getDoubleDigitFormat(lastDay.getDate() + 1) + "T23:59:59.000Z"

    var user = await Auth.currentAuthenticatedUser();
    var data = await API.graphql(graphqlOperation(transactionsByUserDate, {
        limit: TXN_LIMIT,
        user: user.attributes.email, createdAt: { between: [start, end] }
    }));

    console.log(data);

    var sortedTxns = data.data.transactionsByUserDate.items;
    sortedTxns.sort((t1, t2) => {
        var d1 = new Date(t1.date);
        var d2 = new Date(t2.date);
        if (d1 < d2)
            return 1;
        if (d1 > d2)
            return -1;
        return 0;
    });

    console.log(sortedTxns);
    
    var response = {};
    response.categories = getCategoriesFromTransactions(sortedTxns);
    response.transactions = sortedTxns;
    response.VISIBLE_TXNS = sortedTxns;
    return response;
}