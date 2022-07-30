
export const ALL: string = 'all';

export function dateRange(startDate: Date, endDate: Date, steps = 31): Date[] {
    const dateArray: Date[] = [];
    let currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + 1);

    while (currentDate <= new Date(endDate)) {
        dateArray.push(new Date(currentDate));
        var month = currentDate.getMonth() + 1; // increment the month
        var year = month === 0 ? currentDate.getFullYear() + 1 : currentDate.getFullYear(); // if it incremented to January, then increment the year.
        currentDate = new Date(year, month, 1);
    }

    return dateArray;
}

export function getDoubleDigitFormat(number: number) {
    return (number < 10) ? "0" + number : "" + number;
}


export function cleanNumberDataInput(input: string) {
    return input.replace(/[^\d.-]/g, '');
  }
  