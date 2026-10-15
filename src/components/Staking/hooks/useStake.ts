import { useMutation } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import type { PublicKey } from "@solana/web3.js";
import { useAnchorProvider, useRoot } from "../../../providers/hooks";
import { sendTransaction } from "../../../solana/utils";
import { getStakeInstruction } from "../../../solana/staking";

export interface StakeParams {
  amount: number;
  decimals?: number;
  gfmMintAddress?: PublicKey;
  sgfmMintAddress?: PublicKey;
  currentRecord?: number;
}

export default function useStake() {
  const { signTransaction, publicKey } = useWallet();
  const { priorityFee } = useRoot();
  const { anchorProvider } = useAnchorProvider();

  return useMutation({
    mutationFn: async (params: number | StakeParams) => {
      if (!anchorProvider) {
        throw new Error("Anchor provider not found");
      }
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }

      const amount = typeof params === "number" ? params : params.amount;
      const decimals = typeof params === "object" ? params.decimals : undefined;
      const gfmMintAddress =
        typeof params === "object" ? params.gfmMintAddress : undefined;
      const sgfmMintAddress =
        typeof params === "object" ? params.sgfmMintAddress : undefined;
      const currentRecord =
        typeof params === "object" ? params.currentRecord : undefined;

      const instruction = await getStakeInstruction({
        provider: anchorProvider,
        staker: publicKey,
        amount,
        decimals,
        gfmMintAddress,
        sgfmMintAddress,
        currentRecord,
      });

      return sendTransaction({
        connection: anchorProvider.connection,
        payer: publicKey,
        instructions: instruction,
        signTransaction,
        priorityFee,
      });
    },
  });
}
