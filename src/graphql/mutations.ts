/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTransaction = /* GraphQL */ `
  mutation CreateTransaction(
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
      updatedAt
      user
      is_public
    }
  }
`;
export const updateTransaction = /* GraphQL */ `
  mutation UpdateTransaction(
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
      updatedAt
      user
      is_public
    }
  }
`;
export const deleteTransaction = /* GraphQL */ `
  mutation DeleteTransaction(
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
      updatedAt
      user
      is_public
    }
  }
`;
export const createSpendingBudget = /* GraphQL */ `
  mutation CreateSpendingBudget(
    $input: CreateSpendingBudgetInput!
    $condition: ModelSpendingBudgetConditionInput
  ) {
    createSpendingBudget(input: $input, condition: $condition) {
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
export const updateSpendingBudget = /* GraphQL */ `
  mutation UpdateSpendingBudget(
    $input: UpdateSpendingBudgetInput!
    $condition: ModelSpendingBudgetConditionInput
  ) {
    updateSpendingBudget(input: $input, condition: $condition) {
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
export const deleteSpendingBudget = /* GraphQL */ `
  mutation DeleteSpendingBudget(
    $input: DeleteSpendingBudgetInput!
    $condition: ModelSpendingBudgetConditionInput
  ) {
    deleteSpendingBudget(input: $input, condition: $condition) {
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
export const createFriend = /* GraphQL */ `
  mutation CreateFriend(
    $input: CreateFriendInput!
    $condition: ModelFriendConditionInput
  ) {
    createFriend(input: $input, condition: $condition) {
      id
      from
      to
      createdAt
      updatedAt
    }
  }
`;
export const updateFriend = /* GraphQL */ `
  mutation UpdateFriend(
    $input: UpdateFriendInput!
    $condition: ModelFriendConditionInput
  ) {
    updateFriend(input: $input, condition: $condition) {
      id
      from
      to
      createdAt
      updatedAt
    }
  }
`;
export const deleteFriend = /* GraphQL */ `
  mutation DeleteFriend(
    $input: DeleteFriendInput!
    $condition: ModelFriendConditionInput
  ) {
    deleteFriend(input: $input, condition: $condition) {
      id
      from
      to
      createdAt
      updatedAt
    }
  }
`;
export const createFriendRequest = /* GraphQL */ `
  mutation CreateFriendRequest(
    $input: CreateFriendRequestInput!
    $condition: ModelFriendRequestConditionInput
  ) {
    createFriendRequest(input: $input, condition: $condition) {
      id
      from
      to
      createdAt
      updatedAt
    }
  }
`;
export const updateFriendRequest = /* GraphQL */ `
  mutation UpdateFriendRequest(
    $input: UpdateFriendRequestInput!
    $condition: ModelFriendRequestConditionInput
  ) {
    updateFriendRequest(input: $input, condition: $condition) {
      id
      from
      to
      createdAt
      updatedAt
    }
  }
`;
export const deleteFriendRequest = /* GraphQL */ `
  mutation DeleteFriendRequest(
    $input: DeleteFriendRequestInput!
    $condition: ModelFriendRequestConditionInput
  ) {
    deleteFriendRequest(input: $input, condition: $condition) {
      id
      from
      to
      createdAt
      updatedAt
    }
  }
`;
export const createPremiumUsers = /* GraphQL */ `
  mutation CreatePremiumUsers(
    $input: CreatePremiumUsersInput!
    $condition: ModelPremiumUsersConditionInput
  ) {
    createPremiumUsers(input: $input, condition: $condition) {
      id
      user
      oderId
      expiryDate
      createdAt
      updatedAt
    }
  }
`;
export const updatePremiumUsers = /* GraphQL */ `
  mutation UpdatePremiumUsers(
    $input: UpdatePremiumUsersInput!
    $condition: ModelPremiumUsersConditionInput
  ) {
    updatePremiumUsers(input: $input, condition: $condition) {
      id
      user
      oderId
      expiryDate
      createdAt
      updatedAt
    }
  }
`;
export const deletePremiumUsers = /* GraphQL */ `
  mutation DeletePremiumUsers(
    $input: DeletePremiumUsersInput!
    $condition: ModelPremiumUsersConditionInput
  ) {
    deletePremiumUsers(input: $input, condition: $condition) {
      id
      user
      oderId
      expiryDate
      createdAt
      updatedAt
    }
  }
`;
