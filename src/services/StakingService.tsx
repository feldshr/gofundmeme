import { createContext, type PropsWithChildren } from "react";
import { getStakerStakeAccounts, getStaking } from "../solana/staking/states";
import { useAnchorProvider, useRoot } from "./hooks";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import useSyncNetwork from "../hooks/queries/staking/useSyncNetwork";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useWallet } from "@solana/wallet-adapter-react";
import dayjs from "dayjs";
import useClaim from "../hooks/queries/staking/useClaim";
import useUnstake from "../hooks/queries/staking/useUnstake";
import { showTransactionState } from "../solana/utils";

export type StakerStakeAccounts = NonNullable<
  Awaited<ReturnType<typeof getStakerStakeAccounts>>
>["records"];
export type StakerRecord = StakerStakeAccounts extends (infer U)[] ? U : never;

type StakingServiceType = {
  stakingInfoLoading: boolean;
  stakingInfo?: Awaited<ReturnType<typeof getStaking>>;
  handleSync: () => Promise<void>;
  syncPending: boolean;
  handleClaim: (record: StakerRecord) => Promise<void>;
  handleUnstake: (record: StakerRecord) => Promise<void>;
};

export const StakingContext = createContext<StakingServiceType>(
  {} as StakingServiceType
);

const StakingService = ({ children }: PropsWithChildren) => {
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
    })
  );
  const { mutateAsync: claim } = useClaim();
  const { mutateAsync: unstake } = useUnstake();

  const handleSync = async () => {
    if (!stakingInfo) return;
    try {
      const signature = await syncNetwork({
        stakingNetwork: stakingInfo?.stakingNetwork,
        stakingNetworkSyncAccount: stakingInfo?.stakingNetworkSyncAccount,
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
  };

  const handleClaim = async (record: StakerRecord) => {
    if (!record || !stakingInfo) return;
    try {
      if (
        dayjs().isBefore(dayjs(record?.lastClaimedTimestamp).add(1, "minutes"))
      ) {
        throw new Error("You must wait 1 minute between claims");
      }
      const signature = await claim({
        record: record?.record,
        gfmMintAddress: stakingInfo?.gfmToken?.address,
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
  };

  const handleUnstake = async (record: StakerRecord) => {
    if (!record || !stakingInfo) return;
    try {
      const signature = await unstake({
        record: record?.record,
        sgfmMintAddress: stakingInfo?.sgfmMintAddress,
        gfmMintAddress: stakingInfo?.gfmToken?.address,
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
  };

  const refreshAllData = () => {
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
  };

  return (
    <StakingContext.Provider
      value={{
        stakingInfoLoading,
        stakingInfo,
        handleSync,
        syncPending,
        handleClaim,
        handleUnstake,
      }}
    >
      {children}
    </StakingContext.Provider>
  );
};
export default StakingService;
