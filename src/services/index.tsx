import { WalletService } from "./WalletService";
import { RootService } from "./RootService";
import type { PropsWithChildren } from "react";
import AnchorProvider from "./AnchorProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineService } from "./MantineService";
import { Notifications } from "@mantine/notifications";

const queryClient = new QueryClient();

const Services = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineService>
        <Notifications limit={5} autoClose={3000} position="top-center" />
        <RootService>
          <WalletService>
            <AnchorProvider>{children}</AnchorProvider>
          </WalletService>
        </RootService>
      </MantineService>
    </QueryClientProvider>
  );
};

export default Services;
