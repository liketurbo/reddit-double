import { DocumentNode } from "graphql";
import { dedupExchange, fetchExchange } from "urql";
import {
  LoginMutation,
  MeQuery,
  MeDocument,
  RegisterMutation,
  VoteMutationVariables,
} from "../graphql/generated/graphql";
import { cacheExchange, Cache, Resolver } from "@urql/exchange-graphcache";
import { SSRExchange, NextUrqlClientConfig } from "next-urql";
import { pipe, tap } from "wonka";
import { Exchange } from "urql";
import Router from "next/router";
import gql from "graphql-tag";

import { stringifyVariables } from "@urql/core";
import { NextPageContext } from "next";

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

const invalidateAllPosts = (cache: Cache) => {
  const allPostQueries = cache
    .inspectFields("Query")
    .filter((field) => /posts\(.+\)/.test(field.fieldKey));

  allPostQueries.forEach(({ fieldKey }) => {
    cache.invalidate("Query", fieldKey);
  });
};

const createUrqlClient = (ssrExchange: SSRExchange, ctx?: NextPageContext) => ({
  url: process.env.NEXT_PUBLIC_API_URL as string,
  fetchOptions: {
    credentials: "include" as const,
    headers: typeof window === "undefined" && {
      cookie: ctx?.req?.headers.cookie,
    },
  } as any,
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
          removePost: (root, args, cache) => {
            if (!root.removePost) return;

            cache.invalidate({ __typename: "Post", id: args.id as number });
          },
          vote: (_, args, cache) => {
            const { postId, value } = args as VoteMutationVariables;

            const data = cache.readFragment(
              gql`
                fragment _Post on Post {
                  points
                  voteStatus
                }
              `,
              {
                __typename: "Post",
                id: postId,
              }
            );

            const { points, voteStatus } = (data as any) as {
              points: number;
              voteStatus: number | null;
            };

            cache.writeFragment(
              gql`
                fragment __Post on Post {
                  points
                  voteStatus
                }
              `,
              {
                __typename: "Post",
                id: postId,
                points: points + (voteStatus ? 2 : 1) * value,
                voteStatus: value,
              }
            );
          },
          createPost: (_, __, cache) => {
            invalidateAllPosts(cache);
          },
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

            invalidateAllPosts(cache);
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
