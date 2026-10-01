import "@solana/wallet-adapter-react-ui/styles.css";
import type { PropsWithChildren } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  LedgerWalletAdapter,
  CoinbaseWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  PhantomWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { RPC_ENDPOINT_URL } from "../constants";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

export const WalletService = ({ children }: PropsWithChildren) => {
  const wallets = [
    new PhantomWalletAdapter(),
    new CoinbaseWalletAdapter(),
    new SolflareWalletAdapter({ network: WalletAdapterNetwork.Mainnet }),
    new LedgerWalletAdapter(),
    new TorusWalletAdapter(),
  ];

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
