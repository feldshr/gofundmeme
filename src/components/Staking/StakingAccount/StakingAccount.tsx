import { Box, Center, Divider, Flex, Loader, Stack, Text } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useAnchorProvider,
  useRoot,
  useStaking,
} from "../../../services/hooks";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  getAccountBalance,
  getStakerStakeAccounts,
} from "../../../solana/staking/states";
import useCreateAccount from "../../../hooks/queries/staking/useCreateAccount";
import { notifications } from "@mantine/notifications";
import StakingRecords from "../StakingRecords/StakingRecords";
import StakeForm from "../StakeForm/StakeForm";
import { useCallback, useTransition } from "react";
import { showTransactionState } from "../../../solana/utils";
import MantineWalletMultiButton from "../../MantineWalletMultiButton";
import CreateAccountPanel from "./CreateAccountPanel";
import AccountSummary from "./AccountSummary";

const StakingAccount = () => {
  const [isTransitionPending, startTransition] = useTransition();
  const { explorer, gfmRate, solRate } = useRoot();
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();
  const { anchorProvider } = useAnchorProvider();
  const { stakingInfo } = useStaking();
  const { mutateAsync: createAccount, isPending: createAccountLoading } =
    useCreateAccount();
  const { isPending: stakingAccountLoading, data: stakingAccount } = useQuery(
    queryOptions({
      queryKey: ["staking-account", publicKey?.toString()],
      queryFn: () => {
        if (!anchorProvider || !publicKey || !stakingInfo) return;
        return getStakerStakeAccounts({
          provider: anchorProvider,
          gfmMintAddress: stakingInfo?.gfmToken?.address,
          staker: publicKey,
          decimals: stakingInfo?.gfmToken?.decimals,
        });
      },
      staleTime: 5 * 60 * 1000,
      enabled: !!anchorProvider && !!publicKey && !!stakingInfo,
    }),
  );

  const { data: availableBalance } = useQuery(
    queryOptions({
      queryKey: ["available-staking-balance", publicKey?.toString()],
      queryFn: () => {
        if (!anchorProvider || !publicKey || !stakingInfo) return;
        return getAccountBalance({
          connection: anchorProvider.connection,
          mintAddress: stakingInfo?.gfmToken?.address,
          walletAddress: publicKey,
        });
      },
      staleTime: 5 * 60 * 1000,
      enabled: !!anchorProvider && !!publicKey && !!stakingInfo,
    }),
  );

  const { data: stakedBalance } = useQuery(
    queryOptions({
      queryKey: ["staked-balance", publicKey?.toString()],
      queryFn: () => {
        if (!anchorProvider || !publicKey || !stakingInfo) return;
        return getAccountBalance({
          connection: anchorProvider.connection,
          mintAddress: stakingInfo?.sgfmMintAddress,
          walletAddress: publicKey,
        });
      },
      staleTime: 5 * 60 * 1000,
      enabled: !!anchorProvider && !!publicKey && !!stakingInfo,
    }),
  );

  const handleCreateAccount = useCallback(async () => {
    if (!stakingInfo) return;
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
        title: "Error",
        message: e instanceof Error ? e.message : "Something went wrong",
        icon: <IconX />,
      });
      console.error(e);
    }
  }, [stakingInfo, createAccount, explorer, queryClient, publicKey]);

  if (!publicKey) {
    return (
      <Stack gap="xs" align="center">
        <Text ta="center" c="dimmed">
          connect your wallet to see your staked tokens
        </Text>
        <MantineWalletMultiButton size="md" fullWidth />
      </Stack>
    );
  }

  if (stakingAccountLoading) {
    return (
      <Center>
        <Loader color="blue" type="dots" />
      </Center>
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
      <Flex direction={{ base: "column", xs: "row" }} gap="lg" align="center">
        <Box flex={1}>
          <AccountSummary
            availableBalance={availableBalance}
            stakedBalance={stakedBalance}
            claimedRewards={stakingAccount?.claimedRewards}
            gfmRate={gfmRate}
            solRate={solRate}
          />
          <Text size="sm" mt="xs" c="dimmed" ta="center">
            When you stake your tokens, they will remain locked for 7 days,
            followed by a 7-day unstaking window, aligned with each epoch
          </Text>
        </Box>
        <Divider w="100%" display={{ base: "block", xs: "none" }} />
        <Divider
          orientation="vertical"
          display={{ base: "none", xs: "block" }}
        />
        <StakeForm availableBalance={availableBalance} />
      </Flex>
      <Divider my="md" />
      {stakingAccount?.records?.length > 0 && (
        <>
          <StakingRecords list={stakingAccount?.records} />
        </>
      )}
    </Box>
  );
};

export default StakingAccount;
