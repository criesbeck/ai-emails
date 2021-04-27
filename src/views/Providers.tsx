import { OnlyChildren } from "../types";
import { QueryClient, QueryClientProvider } from "react-query";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { HashRouter, MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Router: React.FC<OnlyChildren> = ({ children }) => {
  if (process.env.NODE_ENV === "test") {
    return <MemoryRouter>{children}</MemoryRouter>;
  }
  return <HashRouter>{children}</HashRouter>;
};

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
    <Router>
      <ChakraProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          {children}
          <ToastContainer />
        </QueryClientProvider>
      </ChakraProvider>
    </Router>
  );
};

export default Providers;
