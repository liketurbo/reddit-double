import gql from "graphql-tag";

export const REGISTER_MUTATION = gql`
  mutation($input: UsernamePasswordInput!) {
    register(input: $input) {
      user {
        id
        username
        createdAt
        updatedAt
      }
      errors {
        field
        message
      }
    }
  }
`;
