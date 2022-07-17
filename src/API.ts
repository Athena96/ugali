/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreateTransactionInput = {
  id?: string | null,
  title: string,
  amount?: number | null,
  category?: string | null,
  date: string,
  description?: string | null,
  payment_method?: string | null,
  type?: number | null,
  createdAt?: string | null,
  updatedAt?: string | null,
  user: string,
  is_public?: string | null,
};

export type ModelTransactionConditionInput = {
  title?: ModelStringInput | null,
  amount?: ModelFloatInput | null,
  category?: ModelStringInput | null,
  date?: ModelStringInput | null,
  description?: ModelStringInput | null,
  payment_method?: ModelStringInput | null,
  type?: ModelIntInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  user?: ModelStringInput | null,
  is_public?: ModelStringInput | null,
  and?: Array< ModelTransactionConditionInput | null > | null,
  or?: Array< ModelTransactionConditionInput | null > | null,
  not?: ModelTransactionConditionInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelFloatInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type ModelIntInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type Transaction = {
  __typename: "Transaction",
  id: string,
  title: string,
  amount?: number | null,
  category?: string | null,
  date: string,
  description?: string | null,
  payment_method?: string | null,
  type?: number | null,
  createdAt: string,
  updatedAt: string,
  user: string,
  is_public?: string | null,
};

export type UpdateTransactionInput = {
  id: string,
  title?: string | null,
  amount?: number | null,
  category?: string | null,
  date?: string | null,
  description?: string | null,
  payment_method?: string | null,
  type?: number | null,
  createdAt?: string | null,
  updatedAt?: string | null,
  user?: string | null,
  is_public?: string | null,
};

export type DeleteTransactionInput = {
  id: string,
};

export type CreateSpendingBudgetInput = {
  id?: string | null,
  title: string,
  date: string,
  createdAt?: string | null,
  updatedAt?: string | null,
  user: string,
  categories?: Array< CategoryInput | null > | null,
};

export type CategoryInput = {
  id?: string | null,
  name?: string | null,
  value?: number | null,
};

export type ModelSpendingBudgetConditionInput = {
  title?: ModelStringInput | null,
  date?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  user?: ModelStringInput | null,
  and?: Array< ModelSpendingBudgetConditionInput | null > | null,
  or?: Array< ModelSpendingBudgetConditionInput | null > | null,
  not?: ModelSpendingBudgetConditionInput | null,
};

export type SpendingBudget = {
  __typename: "SpendingBudget",
  id: string,
  title: string,
  date: string,
  createdAt: string,
  updatedAt: string,
  user: string,
  categories?:  Array<Category | null > | null,
};

export type Category = {
  __typename: "Category",
  id?: string | null,
  name?: string | null,
  value?: number | null,
};

export type UpdateSpendingBudgetInput = {
  id: string,
  title?: string | null,
  date?: string | null,
  createdAt?: string | null,
  updatedAt?: string | null,
  user?: string | null,
  categories?: Array< CategoryInput | null > | null,
};

export type DeleteSpendingBudgetInput = {
  id: string,
};

export type CreateFriendInput = {
  id?: string | null,
  from: string,
  to: string,
  createdAt?: string | null,
};

export type ModelFriendConditionInput = {
  from?: ModelStringInput | null,
  to?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  and?: Array< ModelFriendConditionInput | null > | null,
  or?: Array< ModelFriendConditionInput | null > | null,
  not?: ModelFriendConditionInput | null,
};

export type Friend = {
  __typename: "Friend",
  id: string,
  from: string,
  to: string,
  createdAt: string,
  updatedAt: string,
};

export type UpdateFriendInput = {
  id: string,
  from?: string | null,
  to?: string | null,
  createdAt?: string | null,
};

export type DeleteFriendInput = {
  id: string,
};

export type CreateFriendRequestInput = {
  id?: string | null,
  from: string,
  to: string,
  createdAt?: string | null,
};

export type ModelFriendRequestConditionInput = {
  from?: ModelStringInput | null,
  to?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  and?: Array< ModelFriendRequestConditionInput | null > | null,
  or?: Array< ModelFriendRequestConditionInput | null > | null,
  not?: ModelFriendRequestConditionInput | null,
};

export type FriendRequest = {
  __typename: "FriendRequest",
  id: string,
  from: string,
  to: string,
  createdAt: string,
  updatedAt: string,
};

export type UpdateFriendRequestInput = {
  id: string,
  from?: string | null,
  to?: string | null,
  createdAt?: string | null,
};

export type DeleteFriendRequestInput = {
  id: string,
};

export type CreatePremiumUsersInput = {
  id?: string | null,
  user: string,
  oderId: string,
  expiryDate: string,
};

export type ModelPremiumUsersConditionInput = {
  user?: ModelStringInput | null,
  oderId?: ModelStringInput | null,
  expiryDate?: ModelStringInput | null,
  and?: Array< ModelPremiumUsersConditionInput | null > | null,
  or?: Array< ModelPremiumUsersConditionInput | null > | null,
  not?: ModelPremiumUsersConditionInput | null,
};

export type PremiumUsers = {
  __typename: "PremiumUsers",
  id: string,
  user: string,
  oderId: string,
  expiryDate: string,
  createdAt: string,
  updatedAt: string,
};

export type UpdatePremiumUsersInput = {
  id: string,
  user?: string | null,
  oderId?: string | null,
  expiryDate?: string | null,
};

export type DeletePremiumUsersInput = {
  id: string,
};

export type ModelTransactionFilterInput = {
  id?: ModelIDInput | null,
  title?: ModelStringInput | null,
  amount?: ModelFloatInput | null,
  category?: ModelStringInput | null,
  date?: ModelStringInput | null,
  description?: ModelStringInput | null,
  payment_method?: ModelStringInput | null,
  type?: ModelIntInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  user?: ModelStringInput | null,
  is_public?: ModelStringInput | null,
  and?: Array< ModelTransactionFilterInput | null > | null,
  or?: Array< ModelTransactionFilterInput | null > | null,
  not?: ModelTransactionFilterInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelTransactionConnection = {
  __typename: "ModelTransactionConnection",
  items:  Array<Transaction | null >,
  nextToken?: string | null,
};

export type ModelSpendingBudgetFilterInput = {
  id?: ModelIDInput | null,
  title?: ModelStringInput | null,
  date?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  updatedAt?: ModelStringInput | null,
  user?: ModelStringInput | null,
  and?: Array< ModelSpendingBudgetFilterInput | null > | null,
  or?: Array< ModelSpendingBudgetFilterInput | null > | null,
  not?: ModelSpendingBudgetFilterInput | null,
};

export type ModelSpendingBudgetConnection = {
  __typename: "ModelSpendingBudgetConnection",
  items:  Array<SpendingBudget | null >,
  nextToken?: string | null,
};

export type ModelFriendFilterInput = {
  id?: ModelIDInput | null,
  from?: ModelStringInput | null,
  to?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  and?: Array< ModelFriendFilterInput | null > | null,
  or?: Array< ModelFriendFilterInput | null > | null,
  not?: ModelFriendFilterInput | null,
};

export type ModelFriendConnection = {
  __typename: "ModelFriendConnection",
  items:  Array<Friend | null >,
  nextToken?: string | null,
};

export type ModelFriendRequestFilterInput = {
  id?: ModelIDInput | null,
  from?: ModelStringInput | null,
  to?: ModelStringInput | null,
  createdAt?: ModelStringInput | null,
  and?: Array< ModelFriendRequestFilterInput | null > | null,
  or?: Array< ModelFriendRequestFilterInput | null > | null,
  not?: ModelFriendRequestFilterInput | null,
};

export type ModelFriendRequestConnection = {
  __typename: "ModelFriendRequestConnection",
  items:  Array<FriendRequest | null >,
  nextToken?: string | null,
};

export type ModelPremiumUsersFilterInput = {
  id?: ModelIDInput | null,
  user?: ModelStringInput | null,
  oderId?: ModelStringInput | null,
  expiryDate?: ModelStringInput | null,
  and?: Array< ModelPremiumUsersFilterInput | null > | null,
  or?: Array< ModelPremiumUsersFilterInput | null > | null,
  not?: ModelPremiumUsersFilterInput | null,
};

export type ModelPremiumUsersConnection = {
  __typename: "ModelPremiumUsersConnection",
  items:  Array<PremiumUsers | null >,
  nextToken?: string | null,
};

export type ModelTransactionByUserDatePublicCompositeKeyConditionInput = {
  eq?: ModelTransactionByUserDatePublicCompositeKeyInput | null,
  le?: ModelTransactionByUserDatePublicCompositeKeyInput | null,
  lt?: ModelTransactionByUserDatePublicCompositeKeyInput | null,
  ge?: ModelTransactionByUserDatePublicCompositeKeyInput | null,
  gt?: ModelTransactionByUserDatePublicCompositeKeyInput | null,
  between?: Array< ModelTransactionByUserDatePublicCompositeKeyInput | null > | null,
  beginsWith?: ModelTransactionByUserDatePublicCompositeKeyInput | null,
};

export type ModelTransactionByUserDatePublicCompositeKeyInput = {
  date?: string | null,
  is_public?: string | null,
};

export enum ModelSortDirection {
  ASC = "ASC",
  DESC = "DESC",
}


export type ModelStringKeyConditionInput = {
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
};

export type CreateTransactionMutationVariables = {
  input: CreateTransactionInput,
  condition?: ModelTransactionConditionInput | null,
};

export type CreateTransactionMutation = {
  createTransaction?:  {
    __typename: "Transaction",
    id: string,
    title: string,
    amount?: number | null,
    category?: string | null,
    date: string,
    description?: string | null,
    payment_method?: string | null,
    type?: number | null,
    createdAt: string,
    updatedAt: string,
    user: string,
    is_public?: string | null,
  } | null,
};

export type UpdateTransactionMutationVariables = {
  input: UpdateTransactionInput,
  condition?: ModelTransactionConditionInput | null,
};

export type UpdateTransactionMutation = {
  updateTransaction?:  {
    __typename: "Transaction",
    id: string,
    title: string,
    amount?: number | null,
    category?: string | null,
    date: string,
    description?: string | null,
    payment_method?: string | null,
    type?: number | null,
    createdAt: string,
    updatedAt: string,
    user: string,
    is_public?: string | null,
  } | null,
};

export type DeleteTransactionMutationVariables = {
  input: DeleteTransactionInput,
  condition?: ModelTransactionConditionInput | null,
};

export type DeleteTransactionMutation = {
  deleteTransaction?:  {
    __typename: "Transaction",
    id: string,
    title: string,
    amount?: number | null,
    category?: string | null,
    date: string,
    description?: string | null,
    payment_method?: string | null,
    type?: number | null,
    createdAt: string,
    updatedAt: string,
    user: string,
    is_public?: string | null,
  } | null,
};

export type CreateSpendingBudgetMutationVariables = {
  input: CreateSpendingBudgetInput,
  condition?: ModelSpendingBudgetConditionInput | null,
};

export type CreateSpendingBudgetMutation = {
  createSpendingBudget?:  {
    __typename: "SpendingBudget",
    id: string,
    title: string,
    date: string,
    createdAt: string,
    updatedAt: string,
    user: string,
    categories?:  Array< {
      __typename: "Category",
      id?: string | null,
      name?: string | null,
      value?: number | null,
    } | null > | null,
  } | null,
};

export type UpdateSpendingBudgetMutationVariables = {
  input: UpdateSpendingBudgetInput,
  condition?: ModelSpendingBudgetConditionInput | null,
};

export type UpdateSpendingBudgetMutation = {
  updateSpendingBudget?:  {
    __typename: "SpendingBudget",
    id: string,
    title: string,
    date: string,
    createdAt: string,
    updatedAt: string,
    user: string,
    categories?:  Array< {
      __typename: "Category",
      id?: string | null,
      name?: string | null,
      value?: number | null,
    } | null > | null,
  } | null,
};

export type DeleteSpendingBudgetMutationVariables = {
  input: DeleteSpendingBudgetInput,
  condition?: ModelSpendingBudgetConditionInput | null,
};

export type DeleteSpendingBudgetMutation = {
  deleteSpendingBudget?:  {
    __typename: "SpendingBudget",
    id: string,
    title: string,
    date: string,
    createdAt: string,
    updatedAt: string,
    user: string,
    categories?:  Array< {
      __typename: "Category",
      id?: string | null,
      name?: string | null,
      value?: number | null,
    } | null > | null,
  } | null,
};

export type CreateFriendMutationVariables = {
  input: CreateFriendInput,
  condition?: ModelFriendConditionInput | null,
};

export type CreateFriendMutation = {
  createFriend?:  {
    __typename: "Friend",
    id: string,
    from: string,
    to: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateFriendMutationVariables = {
  input: UpdateFriendInput,
  condition?: ModelFriendConditionInput | null,
};

export type UpdateFriendMutation = {
  updateFriend?:  {
    __typename: "Friend",
    id: string,
    from: string,
    to: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteFriendMutationVariables = {
  input: DeleteFriendInput,
  condition?: ModelFriendConditionInput | null,
};

export type DeleteFriendMutation = {
  deleteFriend?:  {
    __typename: "Friend",
    id: string,
    from: string,
    to: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreateFriendRequestMutationVariables = {
  input: CreateFriendRequestInput,
  condition?: ModelFriendRequestConditionInput | null,
};

export type CreateFriendRequestMutation = {
  createFriendRequest?:  {
    __typename: "FriendRequest",
    id: string,
    from: string,
    to: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdateFriendRequestMutationVariables = {
  input: UpdateFriendRequestInput,
  condition?: ModelFriendRequestConditionInput | null,
};

export type UpdateFriendRequestMutation = {
  updateFriendRequest?:  {
    __typename: "FriendRequest",
    id: string,
    from: string,
    to: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeleteFriendRequestMutationVariables = {
  input: DeleteFriendRequestInput,
  condition?: ModelFriendRequestConditionInput | null,
};

export type DeleteFriendRequestMutation = {
  deleteFriendRequest?:  {
    __typename: "FriendRequest",
    id: string,
    from: string,
    to: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type CreatePremiumUsersMutationVariables = {
  input: CreatePremiumUsersInput,
  condition?: ModelPremiumUsersConditionInput | null,
};

export type CreatePremiumUsersMutation = {
  createPremiumUsers?:  {
    __typename: "PremiumUsers",
    id: string,
    user: string,
    oderId: string,
    expiryDate: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type UpdatePremiumUsersMutationVariables = {
  input: UpdatePremiumUsersInput,
  condition?: ModelPremiumUsersConditionInput | null,
};

export type UpdatePremiumUsersMutation = {
  updatePremiumUsers?:  {
    __typename: "PremiumUsers",
    id: string,
    user: string,
    oderId: string,
    expiryDate: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type DeletePremiumUsersMutationVariables = {
  input: DeletePremiumUsersInput,
  condition?: ModelPremiumUsersConditionInput | null,
};

export type DeletePremiumUsersMutation = {
  deletePremiumUsers?:  {
    __typename: "PremiumUsers",
    id: string,
    user: string,
    oderId: string,
    expiryDate: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type GetTransactionQueryVariables = {
  id: string,
};

export type GetTransactionQuery = {
  getTransaction?:  {
    __typename: "Transaction",
    id: string,
    title: string,
    amount?: number | null,
    category?: string | null,
    date: string,
    description?: string | null,
    payment_method?: string | null,
    type?: number | null,
    createdAt: string,
    updatedAt: string,
    user: string,
    is_public?: string | null,
  } | null,
};

export type ListTransactionsQueryVariables = {
  filter?: ModelTransactionFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListTransactionsQuery = {
  listTransactions?:  {
    __typename: "ModelTransactionConnection",
    items:  Array< {
      __typename: "Transaction",
      id: string,
      title: string,
      amount?: number | null,
      category?: string | null,
      date: string,
      description?: string | null,
      payment_method?: string | null,
      type?: number | null,
      createdAt: string,
      updatedAt: string,
      user: string,
      is_public?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetSpendingBudgetQueryVariables = {
  id: string,
};

export type GetSpendingBudgetQuery = {
  getSpendingBudget?:  {
    __typename: "SpendingBudget",
    id: string,
    title: string,
    date: string,
    createdAt: string,
    updatedAt: string,
    user: string,
    categories?:  Array< {
      __typename: "Category",
      id?: string | null,
      name?: string | null,
      value?: number | null,
    } | null > | null,
  } | null,
};

export type ListSpendingBudgetsQueryVariables = {
  filter?: ModelSpendingBudgetFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListSpendingBudgetsQuery = {
  listSpendingBudgets?:  {
    __typename: "ModelSpendingBudgetConnection",
    items:  Array< {
      __typename: "SpendingBudget",
      id: string,
      title: string,
      date: string,
      createdAt: string,
      updatedAt: string,
      user: string,
      categories?:  Array< {
        __typename: "Category",
        id?: string | null,
        name?: string | null,
        value?: number | null,
      } | null > | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetFriendQueryVariables = {
  id: string,
};

export type GetFriendQuery = {
  getFriend?:  {
    __typename: "Friend",
    id: string,
    from: string,
    to: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListFriendsQueryVariables = {
  filter?: ModelFriendFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListFriendsQuery = {
  listFriends?:  {
    __typename: "ModelFriendConnection",
    items:  Array< {
      __typename: "Friend",
      id: string,
      from: string,
      to: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetFriendRequestQueryVariables = {
  id: string,
};

export type GetFriendRequestQuery = {
  getFriendRequest?:  {
    __typename: "FriendRequest",
    id: string,
    from: string,
    to: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListFriendRequestsQueryVariables = {
  filter?: ModelFriendRequestFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListFriendRequestsQuery = {
  listFriendRequests?:  {
    __typename: "ModelFriendRequestConnection",
    items:  Array< {
      __typename: "FriendRequest",
      id: string,
      from: string,
      to: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type GetPremiumUsersQueryVariables = {
  id: string,
};

export type GetPremiumUsersQuery = {
  getPremiumUsers?:  {
    __typename: "PremiumUsers",
    id: string,
    user: string,
    oderId: string,
    expiryDate: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type ListPremiumUserssQueryVariables = {
  filter?: ModelPremiumUsersFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListPremiumUserssQuery = {
  listPremiumUserss?:  {
    __typename: "ModelPremiumUsersConnection",
    items:  Array< {
      __typename: "PremiumUsers",
      id: string,
      user: string,
      oderId: string,
      expiryDate: string,
      createdAt: string,
      updatedAt: string,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type TransactionsByUserDatePublicQueryVariables = {
  user?: string | null,
  dateIs_public?: ModelTransactionByUserDatePublicCompositeKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelTransactionFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type TransactionsByUserDatePublicQuery = {
  transactionsByUserDatePublic?:  {
    __typename: "ModelTransactionConnection",
    items:  Array< {
      __typename: "Transaction",
      id: string,
      title: string,
      amount?: number | null,
      category?: string | null,
      date: string,
      description?: string | null,
      payment_method?: string | null,
      type?: number | null,
      createdAt: string,
      updatedAt: string,
      user: string,
      is_public?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type TransactionsByUserDateQueryVariables = {
  user?: string | null,
  date?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelTransactionFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type TransactionsByUserDateQuery = {
  transactionsByUserDate?:  {
    __typename: "ModelTransactionConnection",
    items:  Array< {
      __typename: "Transaction",
      id: string,
      title: string,
      amount?: number | null,
      category?: string | null,
      date: string,
      description?: string | null,
      payment_method?: string | null,
      type?: number | null,
      createdAt: string,
      updatedAt: string,
      user: string,
      is_public?: string | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type BudgetsByUserDateQueryVariables = {
  user?: string | null,
  date?: ModelStringKeyConditionInput | null,
  sortDirection?: ModelSortDirection | null,
  filter?: ModelSpendingBudgetFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type BudgetsByUserDateQuery = {
  budgetsByUserDate?:  {
    __typename: "ModelSpendingBudgetConnection",
    items:  Array< {
      __typename: "SpendingBudget",
      id: string,
      title: string,
      date: string,
      createdAt: string,
      updatedAt: string,
      user: string,
      categories?:  Array< {
        __typename: "Category",
        id?: string | null,
        name?: string | null,
        value?: number | null,
      } | null > | null,
    } | null >,
    nextToken?: string | null,
  } | null,
};

export type OnCreateTransactionSubscription = {
  onCreateTransaction?:  {
    __typename: "Transaction",
    id: string,
    title: string,
    amount?: number | null,
    category?: string | null,
    date: string,
    description?: string | null,
    payment_method?: string | null,
    type?: number | null,
    createdAt: string,
    updatedAt: string,
    user: string,
    is_public?: string | null,
  } | null,
};

export type OnUpdateTransactionSubscription = {
  onUpdateTransaction?:  {
    __typename: "Transaction",
    id: string,
    title: string,
    amount?: number | null,
    category?: string | null,
    date: string,
    description?: string | null,
    payment_method?: string | null,
    type?: number | null,
    createdAt: string,
    updatedAt: string,
    user: string,
    is_public?: string | null,
  } | null,
};

export type OnDeleteTransactionSubscription = {
  onDeleteTransaction?:  {
    __typename: "Transaction",
    id: string,
    title: string,
    amount?: number | null,
    category?: string | null,
    date: string,
    description?: string | null,
    payment_method?: string | null,
    type?: number | null,
    createdAt: string,
    updatedAt: string,
    user: string,
    is_public?: string | null,
  } | null,
};

export type OnCreateSpendingBudgetSubscription = {
  onCreateSpendingBudget?:  {
    __typename: "SpendingBudget",
    id: string,
    title: string,
    date: string,
    createdAt: string,
    updatedAt: string,
    user: string,
    categories?:  Array< {
      __typename: "Category",
      id?: string | null,
      name?: string | null,
      value?: number | null,
    } | null > | null,
  } | null,
};

export type OnUpdateSpendingBudgetSubscription = {
  onUpdateSpendingBudget?:  {
    __typename: "SpendingBudget",
    id: string,
    title: string,
    date: string,
    createdAt: string,
    updatedAt: string,
    user: string,
    categories?:  Array< {
      __typename: "Category",
      id?: string | null,
      name?: string | null,
      value?: number | null,
    } | null > | null,
  } | null,
};

export type OnDeleteSpendingBudgetSubscription = {
  onDeleteSpendingBudget?:  {
    __typename: "SpendingBudget",
    id: string,
    title: string,
    date: string,
    createdAt: string,
    updatedAt: string,
    user: string,
    categories?:  Array< {
      __typename: "Category",
      id?: string | null,
      name?: string | null,
      value?: number | null,
    } | null > | null,
  } | null,
};

export type OnCreateFriendSubscription = {
  onCreateFriend?:  {
    __typename: "Friend",
    id: string,
    from: string,
    to: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateFriendSubscription = {
  onUpdateFriend?:  {
    __typename: "Friend",
    id: string,
    from: string,
    to: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteFriendSubscription = {
  onDeleteFriend?:  {
    __typename: "Friend",
    id: string,
    from: string,
    to: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreateFriendRequestSubscription = {
  onCreateFriendRequest?:  {
    __typename: "FriendRequest",
    id: string,
    from: string,
    to: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdateFriendRequestSubscription = {
  onUpdateFriendRequest?:  {
    __typename: "FriendRequest",
    id: string,
    from: string,
    to: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeleteFriendRequestSubscription = {
  onDeleteFriendRequest?:  {
    __typename: "FriendRequest",
    id: string,
    from: string,
    to: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnCreatePremiumUsersSubscription = {
  onCreatePremiumUsers?:  {
    __typename: "PremiumUsers",
    id: string,
    user: string,
    oderId: string,
    expiryDate: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnUpdatePremiumUsersSubscription = {
  onUpdatePremiumUsers?:  {
    __typename: "PremiumUsers",
    id: string,
    user: string,
    oderId: string,
    expiryDate: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};

export type OnDeletePremiumUsersSubscription = {
  onDeletePremiumUsers?:  {
    __typename: "PremiumUsers",
    id: string,
    user: string,
    oderId: string,
    expiryDate: string,
    createdAt: string,
    updatedAt: string,
  } | null,
};
