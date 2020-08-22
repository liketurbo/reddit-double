import { ColorModeProvider, CSSReset, ThemeProvider } from "@chakra-ui/core";
import theme from "../theme";

const MyApp = ({ Component, pageProps }: any) => (
  <ThemeProvider theme={theme}>
    <ColorModeProvider>
      <CSSReset />
      <Component {...pageProps} />
    </ColorModeProvider>
  </ThemeProvider>
);

export default MyApp;
