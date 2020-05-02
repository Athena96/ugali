/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getTransaction = /* GraphQL */ `
  query GetTransaction($id: ID!) {
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
export const listTransactions = /* GraphQL */ `
  query ListTransactions(
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
export const getPremiumUsers = /* GraphQL */ `
  query GetPremiumUsers($id: ID!) {
    getPremiumUsers(id: $id) {
      id
      user
      oderId
      expiryDate
    }
  }
`;
export const listPremiumUserss = /* GraphQL */ `
  query ListPremiumUserss(
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
export const transactionsByUserDate = /* GraphQL */ `
  query TransactionsByUserDate(
    $user: String
    $date: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelTransactionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    transactionsByUserDate(
      user: $user
      date: $date
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
export const transactionsByUserRecurring = /* GraphQL */ `
  query TransactionsByUserRecurring(
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
