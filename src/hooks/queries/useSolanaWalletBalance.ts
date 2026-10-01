import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { getSolWalletBalanceOptions } from "../../query/queryOptions";
import { useMemo } from "react";

export default function useSolanaWalletBalance() {
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();
  const options = useMemo(
    () => getSolWalletBalanceOptions(publicKey),
    [publicKey]
  );

  const { data: solBalance } = useQuery(options);

  const invalidateSolBalance = useMemo(
    () => () =>
      queryClient.invalidateQueries({
        queryKey: ["solana-balance", publicKey?.toString()],
        exact: true,
        refetchType: "active",
      }),
    [queryClient, publicKey]
  );

  return { solBalance, invalidateSolBalance };
}
