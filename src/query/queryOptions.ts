import { queryOptions } from "@tanstack/react-query";
import { getTokenUsdRate } from "./queryFunctions";
import { GFM_PUBLIC_KEY, SOL_PUBLIC_KEY } from "../constants";
import { getSolBalance } from "../solana/utils";
import type { PublicKey } from "@solana/web3.js";

export const getGfmUsdRateOptions = () =>
  queryOptions({
    queryKey: ["gfm-rate"],
    queryFn: () => getTokenUsdRate(GFM_PUBLIC_KEY.toString()),
    refetchInterval: 5 * 60 * 1000,
  });

export const getSolUsdRateOptions = () =>
  queryOptions({
    queryKey: ["sol-rate"],
    queryFn: () => getTokenUsdRate(SOL_PUBLIC_KEY.toString()),
    refetchInterval: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

export const getSolWalletBalanceOptions = (publicKey: PublicKey | null) =>
  queryOptions({
    queryKey: ["solana-balance", publicKey?.toString()],
    queryFn: () => getSolBalance(publicKey),
    refetchInterval: 5 * 60 * 1000,
    enabled: !!publicKey,
  });
