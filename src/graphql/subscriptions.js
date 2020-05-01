/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateTransaction = `subscription OnCreateTransaction {
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
export const onUpdateTransaction = `subscription OnUpdateTransaction {
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
export const onDeleteTransaction = `subscription OnDeleteTransaction {
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
export const onCreatePremiumUsers = `subscription OnCreatePremiumUsers {
  onCreatePremiumUsers {
    id
    user
    oderId
    expiryDate
  }
}
`;
export const onUpdatePremiumUsers = `subscription OnUpdatePremiumUsers {
  onUpdatePremiumUsers {
    id
    user
    oderId
    expiryDate
  }
}
`;
export const onDeletePremiumUsers = `subscription OnDeletePremiumUsers {
  onDeletePremiumUsers {
    id
    user
    oderId
    expiryDate
  }
}
`;
