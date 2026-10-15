import {
  Box,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconWallet, IconX } from "@tabler/icons-react";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAnchorProvider, useRoot } from "../../../providers/hooks";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  getStakerStakeAccounts,
  getBalance,
  GFM_PUBLIC_KEY,
  sGFM_PUBLIC_KEY,
  GFM_DECIMALS,
} from "../../../solana";
import useCreateAccount from "../hooks/useCreateAccount";
import { notifications } from "@mantine/notifications";
import StakingRecords from "../StakingRecords/StakingRecords";
import StakeForm from "../StakeForm/StakeForm";
import { useCallback, useMemo, useTransition } from "react";
import { showTransactionState } from "../../../utils/transactionNotifications";
import ConnectWalletButton from "../../ConnectWalletButton";
import CreateAccountPanel from "./CreateAccountPanel";
import AccountSummary from "./AccountSummary";
import { useStaking } from "../context/StakingContext";
import { calculateRecordClaimableRewards } from "../utils";

const StakingAccount = () => {
  const [isTransitionPending, startTransition] = useTransition();
  const { explorer, gfmRate, solRate } = useRoot();
  const { stakingInfo } = useStaking();
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();
  const { anchorProvider } = useAnchorProvider();
  const { mutateAsync: createAccount, isPending: createAccountLoading } =
    useCreateAccount();

  const { isPending: stakingAccountLoading, data: stakingAccount } = useQuery(
    queryOptions({
      queryKey: ["staking-account", publicKey?.toString()],
      queryFn: () => {
        if (!anchorProvider || !publicKey) return;
        return getStakerStakeAccounts({
          provider: anchorProvider,
          staker: publicKey,
          gfmMintAddress: GFM_PUBLIC_KEY,
          decimals: GFM_DECIMALS,
        });
      },
      staleTime: 5 * 60 * 1000,
      enabled: !!anchorProvider && !!publicKey,
    }),
  );

  const { data: availableBalance } = useQuery(
    queryOptions({
      queryKey: ["available-staking-balance", publicKey?.toString()],
      queryFn: () => {
        if (!anchorProvider || !publicKey) return;
        return getBalance({
          connection: anchorProvider.connection,
          mintAddress: GFM_PUBLIC_KEY,
          walletAddress: publicKey,
          decimals: GFM_DECIMALS,
        });
      },
      staleTime: 5 * 60 * 1000,
      enabled: !!anchorProvider && !!publicKey,
    }),
  );

  const { data: stakedBalance } = useQuery(
    queryOptions({
      queryKey: ["staked-balance", publicKey?.toString()],
      queryFn: () => {
        if (!anchorProvider || !publicKey) return;
        return getBalance({
          connection: anchorProvider.connection,
          mintAddress: sGFM_PUBLIC_KEY,
          walletAddress: publicKey,
          decimals: GFM_DECIMALS,
        });
      },
      staleTime: 5 * 60 * 1000,
      enabled: !!anchorProvider && !!publicKey,
    }),
  );

  const totalClaimableRewards = useMemo(() => {
    if (!stakingAccount?.records || !stakingInfo?.cumulativeRewardsPerToken)
      return 0;
    return stakingAccount.records.reduce((acc, rec) => {
      return (
        acc +
        calculateRecordClaimableRewards(
          rec,
          stakingInfo.cumulativeRewardsPerToken,
        )
      );
    }, 0);
  }, [stakingAccount?.records, stakingInfo?.cumulativeRewardsPerToken]);

  const poolSharePercent = useMemo(() => {
    if (
      !stakedBalance ||
      !stakingInfo?.totalStakedTokens ||
      stakingInfo.totalStakedTokens <= 0
    ) {
      return 0;
    }
    return (stakedBalance / stakingInfo.totalStakedTokens) * 100;
  }, [stakedBalance, stakingInfo?.totalStakedTokens]);

  const handleCreateAccount = useCallback(async () => {
    try {
      const signature = await createAccount();
      await showTransactionState(signature, explorer);
      startTransition(() => {
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
          queryKey: ["staking"],
          exact: false,
          refetchType: "active",
        });
        queryClient.invalidateQueries({
          queryKey: ["solana-balance", publicKey?.toString()],
          exact: true,
          refetchType: "active",
        });
      });
    } catch (e) {
      notifications.show({
        color: "red",
        withBorder: true,
        title: "Account Initialization Failed",
        message: e instanceof Error ? e.message : "Something went wrong",
        icon: <IconX />,
      });
      console.error(e);
    }
  }, [createAccount, explorer, queryClient, publicKey]);

  if (!publicKey) {
    return (
      <Paper
        withBorder
        p={{ base: "lg", sm: "xl" }}
        radius="lg"
        shadow="sm"
        style={{
          background: "light-dark(#ffffff, #14151a)",
          borderColor:
            "light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))",
          textAlign: "center",
        }}
      >
        <Stack align="center" gap="md" maw={440} mx="auto">
          <ThemeIcon size={56} radius="xl" variant="light" color="teal">
            <IconWallet size={28} />
          </ThemeIcon>
          <Box>
            <Text fz="lg" fw={700}>
              Connect Wallet to Stake
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              Connect your Solana wallet to view your portfolio, stake $GFM
              tokens, and collect protocol fee distributions in $SOL.
            </Text>
          </Box>
          <ConnectWalletButton size="md" radius="md" />
        </Stack>
      </Paper>
    );
  }

  if (stakingAccountLoading) {
    return (
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Skeleton height={280} radius="lg" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Skeleton height={280} radius="lg" />
        </Grid.Col>
      </Grid>
    );
  }

  if (!stakingAccount) {
    return (
      <CreateAccountPanel
        onCreate={handleCreateAccount}
        loading={createAccountLoading || isTransitionPending}
      />
    );
  }

  return (
    <Box>
      <Grid gutter="md" align="stretch">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <AccountSummary
            availableBalance={availableBalance}
            stakedBalance={stakedBalance}
            claimedRewards={stakingAccount?.claimedRewards}
            claimableRewards={totalClaimableRewards}
            poolSharePercent={poolSharePercent}
            gfmRate={gfmRate}
            solRate={solRate}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <StakeForm availableBalance={availableBalance} />
        </Grid.Col>
      </Grid>

      <Divider my="lg" />

      <StakingRecords list={stakingAccount?.records || []} />
    </Box>
  );
};

export default StakingAccount;
