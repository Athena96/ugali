import React from 'react';


export const monthNames = ["January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"];

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


export function filterTransactions(fyear, fmonth, category, transactions) {
    var filteredTxns = [];

    for (var txn of transactions) {
        var dateParts = txn.date.split("-");
        var year = dateParts[0];
        var month = dateParts[1];

        if (year === fyear && month === fmonth) {
            if (category !== "" && category !== "ALL") {
                // is category a sub or not?
                if (category.includes("-")) {
                    // use exact match if filtering to sub cat level
                    if (txn.category === category) {
                        filteredTxns.push(txn);
                    }
                } else {
                    // get the primary cat
                    const txnPrimaryCat = txn.category.split("-")[0];
                    if (txnPrimaryCat === category) {
                        filteredTxns.push(txn);
                    }
                }
            } else {
                filteredTxns.push(txn);
            }
        }
    }
    return filteredTxns;
}

export function getCCSpending(transactions) {
    var sum = 0.0;
    for (var txn of transactions) {
        if (txn.payment_method.includes("cc") || txn.payment_method.includes("credit")) {
            if (txn.type === 2) {
                sum += txn.amount;
            } else {
                sum -= txn.amount;
            }
        }
    }
    return sum.toFixed(2);
}

export function aggregateTransactions(transactions) {
    var categoryAgg = {}
    for (var txn of transactions) {
        if (categoryAgg[txn.category] === undefined) {
            categoryAgg[txn.category] = 0.0
        }
        categoryAgg[txn.category] += txn.amount;

        if (txn.category.includes('-')) {
            var keyParts = txn.category.split('-');
            var masterKey = keyParts[0];
            if (categoryAgg[masterKey] === undefined) {
                categoryAgg[masterKey] = 0.0
            }
            categoryAgg[masterKey] += txn.amount;
        }
    }
    return categoryAgg;
}

export function getDoubleDigitFormat(number) {
    return (number < 10) ? "0" + number : "" + number;
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

export function getDisplayTransactionsNoFunctions(transactions, IS_PREMIUM_USER, isFriendsTxn=false) {
    return renderDisplayTransactions(transactions, IS_PREMIUM_USER, null, null, null, isFriendsTxn, true);
}

export function renderDisplayTransactions(transactions, IS_PREMIUM_USER, deleteFunc=null, updateFunc=null, duplicateFunc=null, isFriendsTxn=false, groupByDate=false) {
    var txnsArr = [];
    var displayDate;
    var currDay = ""
    var previousCurrDay = "diff"
    for (var transaction of transactions) {
        const { id, user, title, is_public, amount, category, date, recurring_frequency, type, payment_method, description, is_recurring } = transaction;
        var classname = (type === 1) ? "incomeRecurrTxn" : "expenseRecurrTxn";
        const dayIdx = new Date(date);
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        var dayOfWeek = days[dayIdx.getDay()];
        var desc = <div className="desc"><p><b>Description:</b><br />{description}</p></div>;
        var yesmessage = "Yes (" + recurring_frequency + ")";
        var recurring = <><b>Is Recurring Transaction: </b> {is_recurring ? yesmessage : "No"}</>;

        const pub =<><span style={{color:"darkred"}}>Public</span><br /></>;
        const priv = <><span style={{color:"green"}}>Private</span><br /></>;

        var vis;
        if (is_public === null || is_public === undefined || is_public === "") {
            vis = false;
        } else {
            vis = is_public === "true" ? true : false
        }

        currDay = date.split('-')[0] - date.split('-')[1] - date.split('-')[2].split('T')[0] + " " + dayOfWeek;
        displayDate = <h5><b>{date.split('-')[0]}-{date.split('-')[1]}-{date.split('-')[2].split('T')[0]} {dayOfWeek}</b></h5>;

        const hideCat = false;


        var dispDt = "";
        if (currDay !== previousCurrDay) {
            previousCurrDay = currDay;
            dispDt = displayDate;
        }

        txnsArr.push(
            <div>
                {groupByDate ? <>{dispDt}</> : <></>}
                <div className={classname}>
                    <font size="4.5"><b>{date.split('-')[0]}-{date.split('-')[1]}-{date.split('-')[2].split('T')[0]} {dayOfWeek}</b></font><br />
                    <font size="4.5">{title} - ${amount}<br /></font>
                    <p>
                        {isFriendsTxn ? <><b>User:</b> {user}<br /></> : <></>}
                        {hideCat ? <></> : <><b>Category:</b> {category}<br /></>}
                        {isFriendsTxn ? <></> : <><b>Payment Method:</b> {payment_method}<br /></>}
                        {IS_PREMIUM_USER && !isFriendsTxn ? recurring : ""}
                        {description === null ? "" : desc}</p>
                    {deleteFunc ? <button id={id} className="deleteTxnButton" onClick={deleteFunc} >delete</button> : <></> }
                    {duplicateFunc ? <button id={id} className="duplicateTxnButton" onClick={duplicateFunc} >duplicate</button> : <></> }
                    {updateFunc ? <button id={id} className="updateTxnButton" onClick={updateFunc} >update</button> : <></> }
                </div>
            </div>
        );
    }

    return txnsArr;
}