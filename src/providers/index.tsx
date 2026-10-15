import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Notifications } from "@mantine/notifications";
import { ThemeProvider } from "./ThemeProvider";
import { RootProvider } from "./RootProvider";
import { WalletProvider } from "./WalletProvider";
import { AnchorProvider } from "./AnchorProvider";

const queryClient = new QueryClient();

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Notifications limit={5} autoClose={3000} position="top-center" />
        <RootProvider>
          <WalletProvider>
            <AnchorProvider>{children}</AnchorProvider>
          </WalletProvider>
        </RootProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default AppProviders;
