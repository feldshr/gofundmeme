import { useMutation } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import type { PublicKey } from "@solana/web3.js";
import { useAnchorProvider, useRoot } from "../../../providers/hooks";
import { sendTransaction } from "../../../solana/utils";
import { getSyncStakingNetworkInstruction } from "../../../solana/staking";

export default function useSyncNetwork() {
  const { signTransaction, publicKey } = useWallet();
  const { priorityFee } = useRoot();
  const { anchorProvider } = useAnchorProvider();

  return useMutation({
    mutationFn: async (payload?: {
      stakingNetwork?: PublicKey;
      stakingNetworkSyncAccount?: PublicKey;
      gfmMintAddress?: PublicKey;
    }) => {
      if (!anchorProvider) {
        throw new Error("Anchor provider not found");
      }
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }

      const instruction = await getSyncStakingNetworkInstruction({
        provider: anchorProvider,
        auth: publicKey,
        stakingNetwork: payload?.stakingNetwork,
        stakingNetworkSyncAccount: payload?.stakingNetworkSyncAccount,
        gfmMintAddress: payload?.gfmMintAddress,
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
