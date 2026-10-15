import { type PropsWithChildren, useMemo } from "react";
import { AnchorProvider as Provider } from "@coral-xyz/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { COMMITMENT } from "../constants";
import { AnchorContext } from "./AnchorContext";

export const AnchorProvider = ({ children }: PropsWithChildren) => {
  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const { connection } = useConnection();

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

  const value = useMemo(() => ({ anchorProvider }), [anchorProvider]);

  return (
    <AnchorContext.Provider value={value}>
      {children}
    </AnchorContext.Provider>
  );
};

export default AnchorProvider;
