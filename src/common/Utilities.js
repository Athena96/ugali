export var Frequencies = {
    NA: "NA",
    ONCE: "ONCE",
    WEEKLY: "WEEKLY",
    BIWEEKLY: "BIWEEKLY",
    MONTHLY: "MONTHLY",
    FIRST_DAY_OF_MONTH: "FIRST_DAY_OF_MONTH",
    LAST_DAY_OF_MONTH: "LAST_DAY_OF_MONTH",
    YEARLY: "YEARLY"
};

export function getDoubleDigitFormat(number) {
    return (number < 10) ? "0" + number : number;
}

export function getLastDayOfMonthFromDate(currentDay) {
    var lastDateOfMonth = new Date(currentDay.getFullYear(), currentDay.getMonth() + 1, 0);
    return lastDateOfMonth.getDate()
}

export function formatDate(date) {
    var month = getDoubleDigitFormat(date.getMonth() + 1);
    var day = getDoubleDigitFormat(date.getDate());
    return date.getFullYear() + '-' + month + '-' + day;
}

export function convertDateStrToGraphqlDate(dateStr) {
    var dateParts = dateStr.split('-');
    if (dateParts.length >= 3) {
        var year = dateParts[0];
        var month = dateParts[1];
        var day = dateParts[2];

        var currTime = new Date();
        var hour = getDoubleDigitFormat(currTime.getHours());
        var min = getDoubleDigitFormat(currTime.getMinutes());
        var sec = getDoubleDigitFormat(currTime.getSeconds());
        var formattedString = year + '-' + month + '-' + day + 'T' + hour + ':' + min + ':' + sec + '.000Z';
        return formattedString;
    }
}

export function graphqlDateFromJSDate(date) {
    const year = date.getFullYear();
    const month = getDoubleDigitFormat(date.getMonth() + 1);
    const day = getDoubleDigitFormat(date.getDate());
    var hour = getDoubleDigitFormat(date.getHours());
    var min = getDoubleDigitFormat(date.getMinutes());
    var sec = getDoubleDigitFormat(date.getSeconds());
    var formattedString = year + '-' + month + '-' + day + 'T' + hour + ':' + min + ':' + sec + '.000Z';
    return formattedString;
}

export function getCategoriesFromTransactions(transactions) {
    var cats = [];
    for (var txn of transactions) {
        if (!cats.includes(txn.category)) {
            cats.push(txn.category);
        }
    }
    return cats;
}