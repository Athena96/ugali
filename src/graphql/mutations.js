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
      is_recurring
      is_public
      recurring_frequency
      base_recurring_transaction
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
      is_recurring
      is_public
      recurring_frequency
      base_recurring_transaction
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
      is_recurring
      is_public
      recurring_frequency
      base_recurring_transaction
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
      me
      myFriend
      createdAt
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
      me
      myFriend
      createdAt
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
      me
      myFriend
      createdAt
    }
  }
`;
export const createFriendRequest = /* GraphQL */ `
  mutation CreateFriendRequest(
    $input: CreateFriendRequestInput!
    $condition: ModelFriendRequestConditionInput
  ) {
    createFriendRequest(input: $input, condition: $condition) {
      from
      to
      createdAt
    }
  }
`;
export const updateFriendRequest = /* GraphQL */ `
  mutation UpdateFriendRequest(
    $input: UpdateFriendRequestInput!
    $condition: ModelFriendRequestConditionInput
  ) {
    updateFriendRequest(input: $input, condition: $condition) {
      from
      to
      createdAt
    }
  }
`;
export const deleteFriendRequest = /* GraphQL */ `
  mutation DeleteFriendRequest(
    $input: DeleteFriendRequestInput!
    $condition: ModelFriendRequestConditionInput
  ) {
    deleteFriendRequest(input: $input, condition: $condition) {
      from
      to
      createdAt
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
    }
  }
`;
