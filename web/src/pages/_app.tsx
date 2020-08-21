import { ThemeProvider, CSSReset, ColorModeProvider } from "@chakra-ui/core";
import NavBar from "../components/NavBar";
import { createClient, dedupExchange, fetchExchange, Provider } from "urql";
import { cacheExchange, Cache, QueryInput } from "@urql/exchange-graphcache";
import theme from "../theme";
import {
  MeDocument,
  MeQuery,
  LoginMutation,
  RegisterMutation,
} from "../graphql/generated/graphql";
import { DocumentNode } from "graphql";

const createUpdateQuery = <Result, Data>(cache: Cache, result: any) => (
  query: DocumentNode,
  updater: (result: Result, data: Data) => Data
) => {
  cache.updateQuery({ query }, (data) => updater(result, data as any) as any);
};

const client = createClient({
  url: "http://localhost:4000",
  fetchOptions: { credentials: "include" },
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
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
    fetchExchange,
  ],
});

const MyApp = ({ Component, pageProps }: any) => (
  <Provider value={client}>
    <ThemeProvider theme={theme}>
      <ColorModeProvider>
        <CSSReset />
        <NavBar />
        <Component {...pageProps} />
      </ColorModeProvider>
    </ThemeProvider>
  </Provider>
);

export default MyApp;
