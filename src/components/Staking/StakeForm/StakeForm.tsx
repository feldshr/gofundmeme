import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  NumberInput,
  Text,
} from "@mantine/core";
import { useWallet } from "@solana/wallet-adapter-react";
import { IconArrowRight, IconSparkles, IconX } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAnchorProvider, useRoot } from "../../../providers/hooks";
import { isInRange, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import useStake from "../hooks/useStake";
import tokenImage from "../../../assets/GFM.png";
import stakedTokenImage from "../../../assets/sGFM.png";
import { showTransactionState } from "../../../utils/transactionNotifications";
import { GFM_PUBLIC_KEY, sGFM_PUBLIC_KEY, GFM_DECIMALS } from "../../../solana";
import classes from "./StakeForm.module.css";
import { useMemo } from "react";

type FormType = {
  amount: number | string;
};

const StakeForm = ({ availableBalance = 0 }: { availableBalance?: number }) => {
  const { explorer, gfmRate } = useRoot();
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();
  const { anchorProvider } = useAnchorProvider();
  const { mutateAsync: stake, isPending: stakePending } = useStake();

  const form = useForm<FormType>({
    initialValues: {
      amount: "",
    },
    validate: {
      amount: isInRange(
        { min: 0.000000001, max: availableBalance || 0 },
        availableBalance > 0
          ? `Amount must be between 0.01 and ${availableBalance}`
          : "Insufficient $GFM balance in wallet",
      ),
    },
  });

  const numericAmount =
    typeof form.values.amount === "number"
      ? form.values.amount
      : Number(form.values.amount) || 0;

  const estimatedUsd = useMemo(() => {
    if (!numericAmount || !gfmRate) return 0;
    return numericAmount * gfmRate;
  }, [numericAmount, gfmRate]);

  const handlePercentage = (percent: number) => {
    if (!availableBalance || availableBalance <= 0) return;
    if (percent === 1) {
      form.setFieldValue("amount", availableBalance);
    } else {
      const precision = 10000;
      const calculated =
        Math.floor(availableBalance * percent * precision) / precision;
      form.setFieldValue("amount", calculated);
    }
  };

  const handleSubmit = async (values: FormType) => {
    if (
      !publicKey ||
      !anchorProvider ||
      typeof values.amount !== "number" ||
      values.amount <= 0
    ) {
      return;
    }

    try {
      const signature = await stake({
        amount: values.amount,
        decimals: GFM_DECIMALS,
        gfmMintAddress: GFM_PUBLIC_KEY,
        sgfmMintAddress: sGFM_PUBLIC_KEY,
      });
      await showTransactionState(signature, explorer);
      queryClient.invalidateQueries({
        queryKey: ["staking-account", publicKey.toString()],
        exact: false,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["available-staking-balance", publicKey.toString()],
        exact: false,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["staked-balance", publicKey.toString()],
        exact: false,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["staking"],
        exact: false,
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["solana-balance", publicKey.toString()],
        exact: true,
        refetchType: "active",
      });
      form.setFieldValue("amount", "");
    } catch (e) {
      notifications.show({
        color: "red",
        withBorder: true,
        title: "Transaction Failed",
        message:
          e instanceof Error ? e.message : "Something went wrong while staking",
        icon: <IconX />,
      });
      console.error(e);
    }
  };

  const isInsufficient =
    availableBalance <= 0 || numericAmount > availableBalance;

  return (
    <Box className={classes.card}>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        {/* Header */}
        <Group justify="space-between" align="center" mb="sm">
          <Box>
            <Text fw={700} fz="md" lh={1.2}>
              Stake $GFM
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              Deposit $GFM to receive $sGFM and earn SOL
            </Text>
          </Box>
          <Group gap={4} align="center">
            <Text size="xs" c="dimmed">
              Wallet:
            </Text>
            <Text
              size="xs"
              fw={700}
              style={{ cursor: availableBalance > 0 ? "pointer" : "default" }}
              onClick={() => handlePercentage(1)}
              title="Click to use max balance"
            >
              {availableBalance.toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}{" "}
              GFM
            </Text>
          </Group>
        </Group>

        {/* Input box */}
        <Box className={classes.inputWrapper} mb="xs">
          <Flex justify="space-between" align="center" gap="sm">
            <Box style={{ flex: 1 }}>
              <NumberInput
                variant="unstyled"
                allowNegative={false}
                decimalScale={9}
                thousandSeparator=","
                placeholder="0.00"
                hideControls
                max={availableBalance}
                disabled={stakePending || availableBalance <= 0}
                autoComplete="off"
                styles={{
                  input: {
                    fontSize: "22px",
                    fontWeight: 700,
                    height: "auto",
                    padding: 0,
                    lineHeight: 1.2,
                  },
                }}
                key={form.key("amount")}
                {...form.getInputProps("amount")}
              />
              <Text size="xs" c="dimmed" mt={2}>
                {estimatedUsd > 0
                  ? `~$${estimatedUsd.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })} USD`
                  : "$0.00 USD"}
              </Text>
            </Box>

            {/* Token Badge */}
            <div className={classes.tokenBadge}>
              <Avatar radius="xl" src={tokenImage} size={24} />
              <Text fw={700} fz="sm">
                $GFM
              </Text>
            </div>
          </Flex>
        </Box>

        {/* Preset Percentage Buttons */}
        <Group gap={6} mb="md" justify="flex-end">
          {[
            { label: "25%", value: 0.25 },
            { label: "50%", value: 0.5 },
            { label: "75%", value: 0.75 },
            { label: "MAX", value: 1.0 },
          ].map((preset) => (
            <Button
              key={preset.label}
              variant="light"
              color="gray"
              size="compact-xs"
              radius="xl"
              className={classes.presetBtn}
              disabled={!availableBalance || stakePending}
              onClick={() => handlePercentage(preset.value)}
            >
              {preset.label}
            </Button>
          ))}
        </Group>

        {/* Conversion & Staking Ratio Preview */}
        <Box className={classes.conversionBox} mb="md">
          <Group justify="space-between" align="center">
            <Group gap={6} align="center">
              <Avatar src={tokenImage} size={20} radius="xl" />
              <Text size="xs" fw={600}>
                {numericAmount > 0 ? numericAmount.toLocaleString() : "1"} GFM
              </Text>
            </Group>
            <IconArrowRight size={13} style={{ opacity: 0.5 }} />
            <Group gap={6} align="center">
              <Avatar src={stakedTokenImage} size={20} radius="xl" />
              <Text size="xs" fw={600}>
                {numericAmount > 0 ? numericAmount.toLocaleString() : "1"} sGFM
              </Text>
            </Group>
          </Group>
          <Divider my={6} style={{ opacity: 0.5 }} />
          <Group justify="space-between" align="center">
            <Text size="xs" c="dimmed">
              Lock Period:
            </Text>
            <Text size="xs" fw={600}>
              7 Days (then 7-day unstake window)
            </Text>
          </Group>
        </Box>

        {/* Stake Button */}
        <Button
          fullWidth
          size="md"
          radius="md"
          variant="gradient"
          gradient={{ from: "teal", to: "cyan", deg: 90 }}
          leftSection={<IconSparkles size={16} />}
          disabled={
            availableBalance <= 0 ||
            !numericAmount ||
            numericAmount <= 0 ||
            isInsufficient
          }
          loading={stakePending}
          type="submit"
          fw={700}
        >
          {availableBalance <= 0
            ? "Insufficient $GFM"
            : !numericAmount
              ? "Enter Staking Amount"
              : `Stake ${numericAmount.toLocaleString()} $GFM`}
        </Button>
      </form>
    </Box>
  );
};

export default StakeForm;
