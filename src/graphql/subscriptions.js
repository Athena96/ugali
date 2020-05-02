/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateTransaction = /* GraphQL */ `
  subscription OnCreateTransaction {
    onCreateTransaction {
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
export const onUpdateTransaction = /* GraphQL */ `
  subscription OnUpdateTransaction {
    onUpdateTransaction {
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
export const onDeleteTransaction = /* GraphQL */ `
  subscription OnDeleteTransaction {
    onDeleteTransaction {
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
export const onCreatePremiumUsers = /* GraphQL */ `
  subscription OnCreatePremiumUsers {
    onCreatePremiumUsers {
      id
      user
      oderId
      expiryDate
    }
  }
`;
export const onUpdatePremiumUsers = /* GraphQL */ `
  subscription OnUpdatePremiumUsers {
    onUpdatePremiumUsers {
      id
      user
      oderId
      expiryDate
    }
  }
`;
export const onDeletePremiumUsers = /* GraphQL */ `
  subscription OnDeletePremiumUsers {
    onDeletePremiumUsers {
      id
      user
      oderId
      expiryDate
    }
  }
`;
