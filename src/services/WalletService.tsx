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
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { useRoot } from "./hooks";

export const WalletService = ({ children }: PropsWithChildren) => {
  const { activeRpc } = useRoot();

  const wallets = [
    new PhantomWalletAdapter(),
    new CoinbaseWalletAdapter(),
    new SolflareWalletAdapter({ network: WalletAdapterNetwork.Mainnet }),
    new LedgerWalletAdapter(),
    new TorusWalletAdapter(),
  ];

  return (
    <ConnectionProvider endpoint={activeRpc}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
