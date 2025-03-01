import { gql } from "@keystone-6/core/admin-ui/apollo";

export const LIST_QUERY = gql`
  query ListCustomers(
    $where: UserWhereInput! = {}
    $orderBy: [UserOrderByInput!]! = []
    $take: Int
    $skip: Int! = 0
  ) {
    users(where: $where, orderBy: $orderBy, take: $take, skip: $skip) {
      id
      name
      email
      phone
      role {
        id
        name
      }
      customerGroups {
        id
        name
      }
      orders(orderBy: [{ createdAt: desc }], take: 1) {
        id
        createdAt
      }
      createdAt
    }
    usersCount(where: $where)
  }
`;

export const COUNT_QUERY = gql`
  query CountCustomers($where: UserWhereInput! = {}) {
    usersCount(where: $where)
  }
`;

export const DELETE_MUTATION = gql`
  mutation DeleteCustomers($where: UserWhereInput!) {
    deleteUsers(where: $where) {
      id
    }
  }
`;

export const CREATE_MUTATION = gql`
  mutation CreateCustomer($data: UserCreateInput!) {
    createUser(data: $data) {
      id
      name
      email
      phone
      role {
        id
        name
      }
      customerGroups {
        id
        name
      }
      createdAt
    }
  }
`;

export const UPDATE_MUTATION = gql`
  mutation UpdateCustomer($where: UserWhereUniqueInput!, $data: UserUpdateInput!) {
    updateUser(where: $where, data: $data) {
      id
      name
      email
      phone
      role {
        id
        name
      }
      customerGroups {
        id
        name
      }
      createdAt
    }
  }
`; 