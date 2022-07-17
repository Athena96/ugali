
import { PaymentMethod, Transaction, TransactionType } from "../model/Transaction";


export function mapTransactionToDDBItem(transaction: Transaction):  {
    id: string,
    title: string,
    amount?: number | null,
    category?: string | null,
    date: string,
    description?: string | null,
    payment_method?: string | null,
    type?: number | null,
    createdAt: string,
    updatedAt: string,
    user: string,
    is_public?: string | null,
  } {

    return {
        id: transaction.id,
        title: transaction.title,
        amount: transaction.amount,
        category: transaction.category,
        date: transaction.date.toISOString(),
        description: transaction.description,
        payment_method: transaction.paymentMethod.toLocaleLowerCase(),
        type: transaction.transactionType === TransactionType.Expense ? 2 : 1,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
        user: transaction.user,
        is_public: 'false',
    }

}
export function mapDDBItemToTransaction(transaction:  {
    __typename: "Transaction",
    id: string,
    title: string,
    amount?: number | null,
    category?: string | null,
    date: string,
    description?: string | null,
    payment_method?: string | null,
    type?: number | null,
    createdAt: string,
    updatedAt: string,
    user: string,
    is_public?: string | null,
  } | null | undefined): Transaction | undefined {
    if (transaction) {
        const paymentMethod: PaymentMethod = transaction.payment_method === PaymentMethod.Credit.toLocaleLowerCase() ? PaymentMethod.Credit : PaymentMethod.Debit;
        const tpNum = transaction.type || 2;
        const transactionType: TransactionType = tpNum === 2 ? TransactionType.Expense : TransactionType.Income;
        return new Transaction(
            transaction.id,
            transaction.title,
            transaction.amount || 0.0,
            transaction.category || "random",
            new Date(transaction.date) || new Date(),
            transaction.description || "",
            paymentMethod,
            transactionType,
            new Date(transaction.createdAt),
            new Date(transaction.updatedAt),
            transaction.user)
    }

}
