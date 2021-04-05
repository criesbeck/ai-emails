import React from "react";
import { OnlyChildren } from "./types";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import EmailBuddy from "./email-buddy/EmailBuddy";

const theme = extendTheme({
  fonts: {
    body: "Roboto, sans-serif",
    heading: "Roboto Slab, serif",
    mono: "monospace",
  },
});

export const queryClient = new QueryClient();
export const Providers: React.FC<OnlyChildren> = ({ children }) => {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ChakraProvider>
  );
};

const App: React.FC = () => {
  return (
    <Providers>
      <EmailBuddy />
    </Providers>
  );
};

export default App;
