import { useMutation } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { useAnchorProvider, useRoot } from "../../../providers/hooks";
import { sendTransaction } from "../../../solana/utils";
import { getCreateStakerAccountInstruction } from "../../../solana/staking";

export default function useCreateAccount() {
  const { signTransaction, publicKey } = useWallet();
  const { priorityFee } = useRoot();
  const { anchorProvider } = useAnchorProvider();

  return useMutation({
    mutationFn: async () => {
      if (!anchorProvider) {
        throw new Error("Anchor provider not found");
      }
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }

      const instruction = await getCreateStakerAccountInstruction({
        provider: anchorProvider,
        staker: publicKey,
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
