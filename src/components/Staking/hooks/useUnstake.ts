import { useMutation } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import type { PublicKey } from "@solana/web3.js";
import { useAnchorProvider, useRoot } from "../../../providers/hooks";
import { sendTransaction } from "../../../solana/utils";
import { getUnstakeInstruction } from "../../../solana/staking";

export default function useUnstake() {
  const { signTransaction, publicKey } = useWallet();
  const { priorityFee } = useRoot();
  const { anchorProvider } = useAnchorProvider();

  return useMutation({
    mutationFn: async (payload: {
      record: number;
      sgfmMintAddress?: PublicKey;
      gfmMintAddress?: PublicKey;
    }) => {
      if (!anchorProvider) {
        throw new Error("Anchor provider not found");
      }
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }

      const instructions = await getUnstakeInstruction({
        provider: anchorProvider,
        staker: publicKey,
        ...payload,
      });

      return sendTransaction({
        connection: anchorProvider.connection,
        payer: publicKey,
        instructions,
        signTransaction,
        priorityFee,
      });
    },
  });
}
