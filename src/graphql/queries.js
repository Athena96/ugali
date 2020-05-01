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
    updatedAt
    user
    is_recurring
    recurring_frequency
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
      updatedAt
      user
      is_recurring
      recurring_frequency
    }
    nextToken
  }
}
`;
export const getPremiumUsers = `query GetPremiumUsers($id: ID!) {
  getPremiumUsers(id: $id) {
    id
    user
    oderId
    expiryDate
  }
}
`;
export const listPremiumUserss = `query ListPremiumUserss(
  $filter: ModelPremiumUsersFilterInput
  $limit: Int
  $nextToken: String
) {
  listPremiumUserss(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      user
      oderId
      expiryDate
    }
    nextToken
  }
}
`;
export const transactionsByUserDate = `query TransactionsByUserDate(
  $user: String
  $createdAt: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelTransactionFilterInput
  $limit: Int
  $nextToken: String
) {
  transactionsByUserDate(
    user: $user
    createdAt: $createdAt
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
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
      updatedAt
      user
      is_recurring
      recurring_frequency
    }
    nextToken
  }
}
`;
export const transactionsByUserRecurring = `query TransactionsByUserRecurring(
  $user: String
  $is_recurring: ModelStringKeyConditionInput
  $sortDirection: ModelSortDirection
  $filter: ModelTransactionFilterInput
  $limit: Int
  $nextToken: String
) {
  transactionsByUserRecurring(
    user: $user
    is_recurring: $is_recurring
    sortDirection: $sortDirection
    filter: $filter
    limit: $limit
    nextToken: $nextToken
  ) {
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
      updatedAt
      user
      is_recurring
      recurring_frequency
    }
    nextToken
  }
}
`;
