import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Notifications } from "@mantine/notifications";
import { ThemeProvider } from "./ThemeProvider";
import { RootProvider } from "./RootProvider";
import { WalletProvider } from "./WalletProvider";
import { AnchorProvider } from "./AnchorProvider";
import { queryClient } from "../query/client";

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Notifications limit={5} autoClose={3000} position="bottom-right" />
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
