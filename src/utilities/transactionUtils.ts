
import { Category } from "../model/Category";
import { PaymentMethod, Transaction, TransactionType } from "../model/Transaction";



export type CategoryDirectory = {
    name: string;
    transactions: Transaction[];
    sum: number;
    budgetCategory?: Category | undefined;
}
export type DateDirectory = {
    year: number;
    month: number;
    transactions: Transaction[];
    sum: number;
}

export function groupByMonth(transactions: Transaction[]): DateDirectory[] {
    let dateIndex: DateDirectory[] = []
    type DtIndex = {
        [key: string]: {
            year: number;
            month: number;
            transactions: Transaction[];
            sum: number;
        }
      };
    let computeMap: DtIndex = {}
    for (const transaction of transactions) {
        if (transaction.transactionType === TransactionType.Expense && 
            transaction.paymentMethod === PaymentMethod.Credit) {

            const year = transaction.date.getFullYear();
            const month = transaction.date.getMonth()+1;
            const key = `${year}-${month}`
            if (!Object.keys(computeMap).includes(key)) {
                computeMap[key] = {
                    year: year,
                    month: month,
                    transactions: [],
                    sum: 0.0
                }
            }
            computeMap[key].transactions.push(transaction);
            computeMap[key].sum += transaction.amount;
        }
    }

    for (const key of Object.keys(computeMap)) {
        dateIndex.push(computeMap[key])
    }

    return dateIndex;
}
export function groupTransactionsByCategory(transactions: Transaction[]): CategoryDirectory[] {
    let categoryIndex: CategoryDirectory[] = []
    type CatIdx = {
        [key: string]: {
            name: string;
            transactions: Transaction[];
            sum: number
        }
      };
    let computeMap: CatIdx = {}
    for (const transaction of transactions) {
        if (transaction.transactionType === TransactionType.Expense && 
            transaction.paymentMethod === PaymentMethod.Credit) {
                const key = transaction.category;
                if (!Object.keys(computeMap).includes(key)) {
                    computeMap[key] = {
                        transactions: [],
                        sum: 0.0,
                        name: key
                    }
                }
                computeMap[key].transactions.push(transaction);
                computeMap[key].sum += transaction.amount;
            }
    }

    for (const key of Object.keys(computeMap)) {
        categoryIndex.push(computeMap[key])
    }

    return categoryIndex;
}