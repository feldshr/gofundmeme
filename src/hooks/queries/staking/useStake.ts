import { useMutation } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { useAnchorProvider, useRoot } from "../../../services/hooks";
import { createPriorityFeeInstruction } from "../../../solana/utils";
import { stake } from "../../../solana/staking/actions";

export default function useStake() {
  const { signTransaction, publicKey } = useWallet();
  const { priorityFee } = useRoot();
  const { anchorProvider } = useAnchorProvider();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!anchorProvider) {
        throw new Error("Anchor provider not found");
      }
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }

      const instruction = await stake({
        provider: anchorProvider,
        staker: publicKey,
        amount,
      });
      if (!instruction) {
        throw new Error("Failed to create stake instruction");
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
