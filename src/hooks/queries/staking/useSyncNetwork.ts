import { useMutation } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useAnchorProvider, useRoot } from "../../../services/hooks";
import { createPriorityFeeInstruction } from "../../../solana/utils";
import { getsSyncStakingNetworkInstruction } from "../../../solana/staking/actions";

export default function useSyncNetwork() {
  const { signTransaction, publicKey } = useWallet();
  const { priorityFee } = useRoot();
  const { anchorProvider } = useAnchorProvider();

  return useMutation({
    mutationFn: async (payload: {
      stakingNetwork: PublicKey;
      stakingNetworkSyncAccount: PublicKey;
    }) => {
      if (!anchorProvider) {
        throw new Error("Anchor provider not found");
      }
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }

      const instruction = await getsSyncStakingNetworkInstruction({
        provider: anchorProvider,
        auth: publicKey,
        stakingNetwork: payload.stakingNetwork,
        stakingNetworkSyncAccount: payload.stakingNetworkSyncAccount,
      });
      if (!instruction) {
        throw new Error("Failed to create sync instruction");
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
