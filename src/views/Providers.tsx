import { OnlyChildren } from "../types";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

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

export default Providers;
