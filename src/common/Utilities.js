export function getDoubleDigitFormat(number) {
    return (number < 10) ? "0" + number : number;
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