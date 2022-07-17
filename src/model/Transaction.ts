



export enum PaymentMethod {
    Debit = "Debit",
    Credit = "Credit"
}

export enum TransactionType {
    Income = "Income",
    Expense = "Expense"
}

export class Transaction {
    id: string;
    title: string;
    amount: number;
    category: string;
    date: Date;
    description: string;
    paymentMethod: PaymentMethod;
    transactionType: TransactionType;
    createdAt: Date;
    updatedAt: Date;
    user: string;

    constructor(
        id: string,
        title: string,
        amount: number,
        category: string,
        date: Date,
        description: string,
        paymentMethod: PaymentMethod,
        transactionType: TransactionType,
        createdAt: Date,
        updatedAt: Date,
        user: string
        ) {
            this.id = id 
            this.title = title
            this.amount = amount
            this.category = category
            this.date = date
            this.description = description
            this.paymentMethod = paymentMethod
            this.transactionType = transactionType
            this.createdAt = createdAt
            this.updatedAt = updatedAt
            this.user = user
    }

}

