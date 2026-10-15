import {
  useCallback,
  useMemo,
  type PropsWithChildren,
} from "react";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useWallet } from "@solana/wallet-adapter-react";
import dayjs from "dayjs";
import { GFM_PUBLIC_KEY, sGFM_PUBLIC_KEY } from "../../../solana/constants";
import { getStaking } from "../../../solana/staking";
import { useAnchorProvider, useRoot } from "../../../providers/hooks";
import useSyncNetwork from "../hooks/useSyncNetwork";
import useClaim from "../hooks/useClaim";
import useUnstake from "../hooks/useUnstake";
import { showTransactionState } from "../../../utils/transactionNotifications";
import {
  StakingContext,
  type StakerRecord,
  type StakingContextType,
} from "./StakingContext";

export const StakingProvider = ({ children }: PropsWithChildren) => {
  const { explorer } = useRoot();
  const { publicKey } = useWallet();
  const queryClient = useQueryClient();
  const { anchorProvider } = useAnchorProvider();
  const { mutateAsync: syncNetwork, isPending: syncPending } = useSyncNetwork();

  const { isLoading: stakingInfoLoading, data: stakingInfo } = useQuery(
    queryOptions({
      queryKey: ["staking"],
      queryFn: () => {
        if (!anchorProvider) return;
        return getStaking({ provider: anchorProvider });
      },
      refetchInterval: 15 * 60 * 1000,
      enabled: !!anchorProvider,
    }),
  );

  const { mutateAsync: claim } = useClaim();
  const { mutateAsync: unstake } = useUnstake();

  const refreshAllData = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ["staking-account", publicKey?.toString()],
      exact: false,
      refetchType: "active",
    });
    queryClient.invalidateQueries({
      queryKey: ["available-staking-balance", publicKey?.toString()],
      exact: false,
      refetchType: "active",
    });
    queryClient.invalidateQueries({
      queryKey: ["staked-balance", publicKey?.toString()],
      exact: false,
      refetchType: "active",
    });
    queryClient.invalidateQueries({
      queryKey: ["staking"],
      exact: false,
      refetchType: "active",
    });
    queryClient.invalidateQueries({
      queryKey: ["solana-balance", publicKey?.toString()],
      exact: true,
      refetchType: "active",
    });
  }, [queryClient, publicKey]);

  const handleSync = useCallback(async () => {
    try {
      const signature = await syncNetwork({
        stakingNetwork: stakingInfo?.stakingNetwork,
        stakingNetworkSyncAccount: stakingInfo?.stakingNetworkSyncAccount,
        gfmMintAddress: stakingInfo?.gfmToken?.address ?? GFM_PUBLIC_KEY,
      });
      await showTransactionState(signature, explorer);
      refreshAllData();
    } catch (e) {
      notifications.show({
        color: "red",
        withBorder: true,
        title: "Error",
        message: e instanceof Error ? e.message : "Something went wrong",
        icon: <IconX />,
      });
      console.error(e);
    }
  }, [stakingInfo, syncNetwork, explorer, refreshAllData]);

  const handleClaim = useCallback(
    async (record: StakerRecord) => {
      if (!record) return;
      try {
        if (
          dayjs().isBefore(dayjs(record?.lastClaimedTimestamp).add(1, "minutes"))
        ) {
          throw new Error("You must wait 1 minute between claims");
        }
        const signature = await claim({
          record: record?.record,
          gfmMintAddress: stakingInfo?.gfmToken?.address ?? GFM_PUBLIC_KEY,
        });
        await showTransactionState(signature, explorer);
        refreshAllData();
      } catch (e) {
        notifications.show({
          color: "red",
          withBorder: true,
          title: "Error",
          message: e instanceof Error ? e.message : "Something went wrong",
          icon: <IconX />,
        });
        console.error(e);
      }
    },
    [stakingInfo, claim, explorer, refreshAllData],
  );

  const handleUnstake = useCallback(
    async (record: StakerRecord) => {
      if (!record) return;
      try {
        const signature = await unstake({
          record: record?.record,
          sgfmMintAddress: stakingInfo?.sgfmMintAddress ?? sGFM_PUBLIC_KEY,
          gfmMintAddress: stakingInfo?.gfmToken?.address ?? GFM_PUBLIC_KEY,
        });
        await showTransactionState(signature, explorer);
        refreshAllData();
      } catch (e) {
        notifications.show({
          color: "red",
          withBorder: true,
          title: "Error",
          message: e instanceof Error ? e.message : "Something went wrong",
          icon: <IconX />,
        });
        console.error(e);
      }
    },
    [stakingInfo, unstake, explorer, refreshAllData],
  );

  const value = useMemo<StakingContextType>(
    () => ({
      stakingInfoLoading,
      stakingInfo,
      handleSync,
      syncPending,
      handleClaim,
      handleUnstake,
    }),
    [
      stakingInfoLoading,
      stakingInfo,
      handleSync,
      syncPending,
      handleClaim,
      handleUnstake,
    ],
  );

  return (
    <StakingContext.Provider value={value}>
      {children}
    </StakingContext.Provider>
  );
};

export default StakingProvider;

