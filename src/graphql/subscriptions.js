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
      me
      myFriend
      createdAt
    }
  }
`;
export const onUpdateFriend = /* GraphQL */ `
  subscription OnUpdateFriend {
    onUpdateFriend {
      me
      myFriend
      createdAt
    }
  }
`;
export const onDeleteFriend = /* GraphQL */ `
  subscription OnDeleteFriend {
    onDeleteFriend {
      me
      myFriend
      createdAt
    }
  }
`;
export const onCreateFriendRequest = /* GraphQL */ `
  subscription OnCreateFriendRequest {
    onCreateFriendRequest {
      from
      to
      createdAt
    }
  }
`;
export const onUpdateFriendRequest = /* GraphQL */ `
  subscription OnUpdateFriendRequest {
    onUpdateFriendRequest {
      from
      to
      createdAt
    }
  }
`;
export const onDeleteFriendRequest = /* GraphQL */ `
  subscription OnDeleteFriendRequest {
    onDeleteFriendRequest {
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
