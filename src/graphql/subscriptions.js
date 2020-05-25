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
      is_public
      recurring_frequency
      base_recurring_transaction
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
      is_public
      recurring_frequency
      base_recurring_transaction
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
      is_public
      recurring_frequency
      base_recurring_transaction
    }
  }
`;
export const onCreateFriend = /* GraphQL */ `
  subscription OnCreateFriend {
    onCreateFriend {
      id
      from
      to
      createdAt
    }
  }
`;
export const onUpdateFriend = /* GraphQL */ `
  subscription OnUpdateFriend {
    onUpdateFriend {
      id
      from
      to
      createdAt
    }
  }
`;
export const onDeleteFriend = /* GraphQL */ `
  subscription OnDeleteFriend {
    onDeleteFriend {
      id
      from
      to
      createdAt
    }
  }
`;
export const onCreateFriendRequest = /* GraphQL */ `
  subscription OnCreateFriendRequest {
    onCreateFriendRequest {
      id
      from
      to
      createdAt
    }
  }
`;
export const onUpdateFriendRequest = /* GraphQL */ `
  subscription OnUpdateFriendRequest {
    onUpdateFriendRequest {
      id
      from
      to
      createdAt
    }
  }
`;
export const onDeleteFriendRequest = /* GraphQL */ `
  subscription OnDeleteFriendRequest {
    onDeleteFriendRequest {
      id
      from
      to
      createdAt
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
