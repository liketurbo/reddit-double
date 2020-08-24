import { DocumentNode } from "graphql";
import { dedupExchange, fetchExchange, Query } from "urql";
import {
  LoginMutation,
  MeQuery,
  MeDocument,
  RegisterMutation,
  Post,
} from "../graphql/generated/graphql";
import { cacheExchange, Cache, Resolver } from "@urql/exchange-graphcache";
import { SSRExchange } from "next-urql";
import { pipe, tap } from "wonka";
import { Exchange } from "urql";
import Router from "next/router";

import { stringifyVariables } from "@urql/core";

export interface PaginationParams {
  offsetArgument?: string;
  limitArgument?: string;
}

const cursorPagination: Resolver = (parent, args, cache, info) => {
  const allPostQueries = cache
    .inspectFields("Query")
    .filter((field) => /posts\(.+\)/.test(field.fieldKey));

  const posts: string[] = [];
  let hasMore = true;

  allPostQueries.forEach(({ fieldKey }) => {
    posts.push(...(cache.resolve(`Query.${fieldKey}`, "posts") as string[]));
    hasMore =
      hasMore && (cache.resolve(`Query.${fieldKey}`, "hasMore") as boolean);
  });

  const newPosts = cache.resolveFieldByKey(
    "Query",
    `posts(${stringifyVariables(args)})`
  ) as string | null;

  if (!newPosts)
    return {
      __typename: "PaginatedPosts",
      hasMore: parent.hasMore,
      posts: [...posts, ...((parent.posts || []) as any)],
    };

  return {
    __typename: "PaginatedPosts",
    hasMore,
    posts,
  };
};

export const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      // If the OperationResult has an error send a request to sentry
      if (error?.message.includes("Not authenticated")) {
        // the error is a CombinedError with networkError and graphqlErrors properties
        Router.replace("/login");
      }
    })
  );
};

const createUpdateQuery = <Result, Data>(cache: Cache, result: any) => (
  query: DocumentNode,
  updater: (result: Result, data: Data) => Data
) => {
  cache.updateQuery({ query }, (data) => updater(result, data as any) as any);
};

const createUrqlClient = (ssrExchange: SSRExchange) => ({
  url: "http://localhost:4000",
  fetchOptions: { credentials: "include" } as const,
  exchanges: [
    dedupExchange,
    cacheExchange({
      keys: {
        PaginatedPosts: () => null,
      },
      resolvers: {
        Query: {
          posts: cursorPagination,
        },
      },
      updates: {
        Mutation: {
          logout: (result, __, cache) => {
            const updateQuery = createUpdateQuery<LoginMutation, MeQuery>(
              cache,
              result
            );

            updateQuery(MeDocument, (_, data) => {
              data.me.user = null;
              return data;
            });
          },
          login: (result, __, cache) => {
            const updateQuery = createUpdateQuery<LoginMutation, MeQuery>(
              cache,
              result
            );

            updateQuery(MeDocument, (result, data) => {
              if (result.login.errors) return data;

              data.me.user = result.login.user;
              return data;
            });
          },
          register: (result, __, cache) => {
            const updateQuery = createUpdateQuery<RegisterMutation, MeQuery>(
              cache,
              result
            );

            updateQuery(MeDocument, (result, data) => {
              if (result.register.errors) return data;

              data.me.user = result.register.user;
              return data;
            });
          },
        },
      },
    }),
    errorExchange,
    ssrExchange,
    fetchExchange,
  ],
});

export default createUrqlClient;
