import { Avatar, Box, Button, Flex, NumberInput, Text } from "@mantine/core";
import { useWallet } from "@solana/wallet-adapter-react";
import { IconPhotoOff, IconX } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAnchorProvider,
  useRoot,
  useStaking,
} from "../../../services/hooks";
import { isInRange, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import useStake from "../../../hooks/queries/staking/useStake";
import tokenImage from "../../../assets/GFM.png";
import { showTransactionState } from "../../../solana/utils";

type FormType = {
  amount: number | string;
};

const StakeFormModal = ({
  availableBalance,
}: {
  availableBalance?: number;
}) => {
  const { explorer } = useRoot();
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();
  const { anchorProvider } = useAnchorProvider();
  const { stakingInfo } = useStaking();
  const { mutateAsync: stake, isPending: stakePending } = useStake();
  const form = useForm<FormType>({
    initialValues: {
      amount: "",
    },
    validate: {
      amount: isInRange(
        { min: 0.000000001, max: availableBalance || 0 },
        typeof availableBalance !== "undefined" && availableBalance > 0
          ? `Amount must be between 0.01 and ${availableBalance || 0}`
          : "There are not enough tokens in the wallet"
      ),
    },
  });

  const handleHalfClick = () => {
    if (!availableBalance) return;
    form.setFieldValue("amount", availableBalance / 2);
  };

  const handleMaxClick = () => {
    if (!availableBalance) return;
    form.setFieldValue("amount", availableBalance);
  };

  const handleSubmit = async (values: FormType) => {
    if (
      !stakingInfo ||
      !publicKey ||
      !anchorProvider ||
      typeof values.amount !== "number"
    )
      return;
    try {
      const signature = await stake(values.amount);
      await showTransactionState(signature, explorer);
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
      form.setFieldValue("amount", "");
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

  return (
    <Box w={300} maw="100%" m="auto">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Flex justify="space-between" align="center" mb={4}>
          <Text size="md" fw={700}>
            Amount
          </Text>
          <Flex align="center" gap={4}>
            <Button
              variant="light"
              size="compact-xs"
              radius="xl"
              disabled={!availableBalance || stakePending}
              onClick={handleHalfClick}
            >
              half
            </Button>
            <Button
              variant="light"
              size="compact-xs"
              radius="xl"
              disabled={!availableBalance || stakePending}
              onClick={handleMaxClick}
            >
              max
            </Button>
          </Flex>
        </Flex>
        <NumberInput
          variant="default"
          allowNegative={false}
          decimalScale={9}
          thousandSeparator=","
          size="md"
          placeholder="0.00"
          hideControls
          max={availableBalance}
          disabled={stakePending}
          autoComplete="off"
          leftSection={
            <Avatar
              variant="transparent"
              radius={20}
              src={tokenImage}
              display="inline-flex"
              style={{
                align: "center",
                justifyContent: "center",
              }}
              size={20}
            >
              <IconPhotoOff size={16} />
            </Avatar>
          }
          key={form.key("amount")}
          {...form.getInputProps("amount")}
        />
        <Button
          fullWidth
          mt="xs"
          disabled={availableBalance === 0}
          loading={stakePending}
          type="submit"
        >
          stake
        </Button>
      </form>
    </Box>
  );
};

export default StakeFormModal;
