import { DocumentNode } from "graphql";
import { dedupExchange, fetchExchange } from "urql";
import {
  LoginMutation,
  MeQuery,
  MeDocument,
  RegisterMutation,
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

const cursorPagination: Resolver = (_, args, cache, info) => {
  const { parentKey, fieldName } = info;

  const allFields = cache.inspectFields(parentKey);
  const fieldInfos = allFields.filter((info) => info.fieldName === fieldName);

  if (!fieldInfos.length) return undefined;

  const fieldKey = `${fieldName}(${stringifyVariables(args)})`;

  info.partial = !cache.resolveFieldByKey(parentKey, fieldKey);

  const res: string[] = [];

  fieldInfos.forEach((fi) => {
    const data = cache.resolveFieldByKey(parentKey, fi.fieldKey) as string[];
    res.push(...data);
  });

  return res;

  /*
    const visited = new Set();
    let result: NullArray<string> = [];
    let prevOffset: number | null = null;

    for (let i = 0; i < size; i++) {
      const { fieldKey, arguments: args } = fieldInfos[i];
      if (args === null || !compareArgs(fieldArgs, args)) {
        continue;
      }

      const links = cache.resolveFieldByKey(entityKey, fieldKey) as string[];
      const currentOffset = args[cursorArgument];

      if (
        links === null ||
        links.length === 0 ||
        typeof currentOffset !== "number"
      ) {
        continue;
      }

      if (!prevOffset || currentOffset > prevOffset) {
        for (let j = 0; j < links.length; j++) {
          const link = links[j];
          if (visited.has(link)) continue;
          result.push(link);
          visited.add(link);
        }
      } else {
        const tempResult: NullArray<string> = [];
        for (let j = 0; j < links.length; j++) {
          const link = links[j];
          if (visited.has(link)) continue;
          tempResult.push(link);
          visited.add(link);
        }
        result = [...tempResult, ...result];
      }

      prevOffset = currentOffset;
    }

    const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    if (hasCurrentPage) {
      return result;
    } else if (!(info as any).store.schema) {
      return undefined;
    } else {
      info.partial = true;
      return result;
    }

  */
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
