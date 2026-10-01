import React, { type ReactNode, useMemo, createContext } from "react";
import { AnchorProvider as Provider } from "@coral-xyz/anchor";
import { Connection } from "@solana/web3.js";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { COMMITMENT, RPC_ENDPOINT_URL } from "../constants";

interface AnchorProviderProps {
  children: ReactNode;
}

type AnchorProviderType = {
  anchorProvider: Provider | null;
};

const ProviderContext = createContext<AnchorProviderType>(
  {} as AnchorProviderType
);

const AnchorProvider: React.FC<AnchorProviderProps> = ({ children }) => {
  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const connection = useMemo(
    () => new Connection(RPC_ENDPOINT_URL, COMMITMENT),
    []
  );

  const anchorProvider = useMemo(() => {
    if (
      wallet.connected &&
      wallet.signTransaction &&
      wallet.signAllTransactions &&
      wallet.publicKey
    ) {
      const w = {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions,
      };
      return new Provider(connection, w, {
        preflightCommitment: "singleGossip",
        commitment: COMMITMENT,
      });
    } else if (anchorWallet) {
      return new Provider(connection, anchorWallet, {
        preflightCommitment: "singleGossip",
        commitment: COMMITMENT,
      });
    }
    return new Provider(connection, null!, {
      preflightCommitment: "singleGossip",
      commitment: COMMITMENT,
    });
  }, [
    wallet.connected,
    wallet.signTransaction,
    wallet.signAllTransactions,
    wallet.publicKey,
    anchorWallet,
    connection,
  ]);

  return (
    <ProviderContext.Provider value={{ anchorProvider }}>
      {children}
    </ProviderContext.Provider>
  );
};

export default AnchorProvider;

export { ProviderContext };
