import { useMutation } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useAnchorProvider, useRoot } from "../../../services/hooks";
import { createPriorityFeeInstruction } from "../../../solana/utils";
import { getClaimInstruction } from "../../../solana/staking/actions";

export default function useClaim() {
  const { signTransaction, publicKey } = useWallet();
  const { priorityFee } = useRoot();
  const { anchorProvider } = useAnchorProvider();

  return useMutation({
    mutationFn: async (payload: {
      record: number;
      gfmMintAddress: PublicKey;
    }) => {
      if (!anchorProvider) {
        throw new Error("Anchor provider not found");
      }
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }

      const instruction = await getClaimInstruction({
        provider: anchorProvider,
        staker: publicKey,
        ...payload,
      });

      if (!instruction) {
        throw new Error("Failed to create claim instruction");
      }
      // Priority fee
      const priorityInstructions = createPriorityFeeInstruction(priorityFee);

      // Create and send transaction
      const transaction = new Transaction()
        .add(instruction)
        .add(...priorityInstructions);
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = (
        await anchorProvider.connection.getLatestBlockhash("finalized")
      ).blockhash;

      // Sign the transaction
      const signedTransaction = await signTransaction(transaction);

      // Send the transaction
      const signature = await anchorProvider.connection.sendRawTransaction(
        signedTransaction.serialize()
      );
      await anchorProvider.connection.getSignatureStatuses([signature]);
      return signature;
    },
  });
}
