/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getTransaction = `query GetTransaction($id: ID!) {
  getTransaction(id: $id) {
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
    is_recurring
  }
}
`;
export const listTransactions = `query ListTransactions(
  $filter: ModelTransactionFilterInput
  $limit: Int
  $nextToken: String
) {
  listTransactions(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
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
      is_recurring
    }
    nextToken
  }
}
`;
