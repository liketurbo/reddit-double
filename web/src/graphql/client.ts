import { ApolloClient, InMemoryCache } from "@apollo/client";
import { PaginatedPosts } from "../graphql/generated/graphql";
import { NextPageContext } from "next";

const client = (ctx: NextPageContext) =>
  new ApolloClient({
    uri: process.env.NEXT_PUBLIC_API_URL,
    credentials: "include",
    headers:
      typeof window === "undefined"
        ? {
            cookie: ctx?.req?.headers.cookie || "",
          }
        : undefined,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            posts: {
              keyArgs: [],
              merge(
                existing: PaginatedPosts | undefined,
                incoming: PaginatedPosts
              ): PaginatedPosts {
                return {
                  ...incoming,
                  posts: [...(existing?.posts || []), ...incoming.posts],
                };
              },
            },
          },
        },
      },
    }),
  });

export default client;
