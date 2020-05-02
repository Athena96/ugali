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
      recurring_frequency
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
      recurring_frequency
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
      recurring_frequency
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
