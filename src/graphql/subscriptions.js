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
      is_public
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
      is_public
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
      is_public
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
      updatedAt
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
      updatedAt
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
      updatedAt
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
      updatedAt
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
      updatedAt
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
      updatedAt
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
      createdAt
      updatedAt
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
      createdAt
      updatedAt
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
      createdAt
      updatedAt
    }
  }
`;
