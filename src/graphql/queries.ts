/* tslint:disable */
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
      is_public
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
        is_public
      }
      nextToken
    }
  }
`;
export const getSpendingBudget = /* GraphQL */ `
  query GetSpendingBudget($id: ID!) {
    getSpendingBudget(id: $id) {
      id
      title
      date
      createdAt
      updatedAt
      user
      categories {
        id
        name
        value
      }
    }
  }
`;
export const listSpendingBudgets = /* GraphQL */ `
  query ListSpendingBudgets(
    $filter: ModelSpendingBudgetFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSpendingBudgets(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        date
        createdAt
        updatedAt
        user
        categories {
          id
          name
          value
        }
      }
      nextToken
    }
  }
`;
export const getFriend = /* GraphQL */ `
  query GetFriend($id: ID!) {
    getFriend(id: $id) {
      id
      from
      to
      createdAt
      updatedAt
    }
  }
`;
export const listFriends = /* GraphQL */ `
  query ListFriends(
    $filter: ModelFriendFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFriends(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        from
        to
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getFriendRequest = /* GraphQL */ `
  query GetFriendRequest($id: ID!) {
    getFriendRequest(id: $id) {
      id
      from
      to
      createdAt
      updatedAt
    }
  }
`;
export const listFriendRequests = /* GraphQL */ `
  query ListFriendRequests(
    $filter: ModelFriendRequestFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFriendRequests(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        from
        to
        createdAt
        updatedAt
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
      createdAt
      updatedAt
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
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const transactionsByUserDatePublic = /* GraphQL */ `
  query TransactionsByUserDatePublic(
    $user: String
    $dateIs_public: ModelTransactionByUserDatePublicCompositeKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelTransactionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    transactionsByUserDatePublic(
      user: $user
      dateIs_public: $dateIs_public
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
        is_public
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
        is_public
      }
      nextToken
    }
  }
`;
export const budgetsByUserDate = /* GraphQL */ `
  query BudgetsByUserDate(
    $user: String
    $date: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelSpendingBudgetFilterInput
    $limit: Int
    $nextToken: String
  ) {
    budgetsByUserDate(
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
        date
        createdAt
        updatedAt
        user
        categories {
          id
          name
          value
        }
      }
      nextToken
    }
  }
`;
