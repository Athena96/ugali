/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTransaction = `mutation CreateTransaction(
  $input: CreateTransactionInput!
  $condition: ModelTransactionConditionInput
) {
  createTransaction(input: $input, condition: $condition) {
    id
    title
    amount
    category
    date
    description
    payment_method
    type
    createdAt
    user
  }
}
`;
export const updateTransaction = `mutation UpdateTransaction(
  $input: UpdateTransactionInput!
  $condition: ModelTransactionConditionInput
) {
  updateTransaction(input: $input, condition: $condition) {
    id
    title
    amount
    category
    date
    description
    payment_method
    type
    createdAt
    user
  }
}
`;
export const deleteTransaction = `mutation DeleteTransaction(
  $input: DeleteTransactionInput!
  $condition: ModelTransactionConditionInput
) {
  deleteTransaction(input: $input, condition: $condition) {
    id
    title
    amount
    category
    date
    description
    payment_method
    type
    createdAt
    user
  }
}
`;