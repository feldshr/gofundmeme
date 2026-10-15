import "@solana/wallet-adapter-react-ui/styles.css";
import { useMemo, type PropsWithChildren } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { LedgerWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useRoot } from "./hooks";
import { WalletNotificationWatcher } from "./WalletNotificationWatcher";

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const { activeRpc } = useRoot();

  // All modern wallets (Phantom, Solflare, Coinbase, Backpack, etc.) implement
  // the Solana Wallet Standard and are registered automatically.
  // We only provide legacy hardware adapters (like Ledger) here.
  const wallets = useMemo(() => [new LedgerWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={activeRpc}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletNotificationWatcher />
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

export default WalletProvider;

