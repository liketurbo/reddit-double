import { ThemeProvider, CSSReset, ColorModeProvider } from "@chakra-ui/core";
import { createClient, Provider } from "urql";
import NavBar from "../components/NavBar";

import theme from "../theme";

const client = createClient({
  url: "http://localhost:4000",
  fetchOptions: { credentials: "include" },
});

const MyApp = ({ Component, pageProps }) => (
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
