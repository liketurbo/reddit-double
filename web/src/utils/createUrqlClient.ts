import { DocumentNode } from "graphql";
import { dedupExchange, fetchExchange } from "urql";
import {
  LoginMutation,
  MeQuery,
  MeDocument,
  RegisterMutation,
} from "../graphql/generated/graphql";
import { cacheExchange, Cache } from "@urql/exchange-graphcache";
import { SSRExchange } from "next-urql";

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
    ssrExchange,
    fetchExchange,
  ],
});

export default createUrqlClient;
