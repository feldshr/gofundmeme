import {
  Avatar,
  Badge,
  Box,
  Group,
  SimpleGrid,
  Text,
  Tooltip,
} from "@mantine/core";
import { useMemo } from "react";
import tokenImage from "../../../assets/GFM.png";
import stakedTokenImage from "../../../assets/sGFM.png";
import { IconShieldCheck } from "@tabler/icons-react";
import SolanaLogo from "../../img/SolanaLogo";
import classes from "./AccountSummary.module.css";

type AccountSummaryProps = {
  availableBalance?: number;
  stakedBalance?: number;
  claimedRewards?: number;
  claimableRewards?: number;
  poolSharePercent?: number;
  gfmRate?: number;
  solRate?: number;
};

const AccountSummary = ({
  availableBalance = 0,
  stakedBalance = 0,
  claimedRewards = 0,
  claimableRewards = 0,
  poolSharePercent = 0,
  gfmRate,
  solRate,
}: AccountSummaryProps) => {
  const availableUsd = useMemo(() => {
    if (!availableBalance || !gfmRate) return;
    return availableBalance * gfmRate;
  }, [availableBalance, gfmRate]);

  const stakedBalanceUsd = useMemo(() => {
    if (!stakedBalance || !gfmRate) return;
    return stakedBalance * gfmRate;
  }, [stakedBalance, gfmRate]);

  const claimedUsd = useMemo(() => {
    if (!claimedRewards || !solRate) return;
    return claimedRewards * solRate;
  }, [claimedRewards, solRate]);

  const claimableUsd = useMemo(() => {
    if (!claimableRewards || !solRate) return;
    return claimableRewards * solRate;
  }, [claimableRewards, solRate]);

  return (
    <Box className={classes.card}>
      <Box>
        {/* Header */}
        <Group justify="space-between" align="center" mb="md">
          <Box>
            <Text fw={700} fz="md" lh={1.2}>
              Your staking portfolio
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              Real-time summary of your balances and earned protocol fees
            </Text>
          </Box>
          {poolSharePercent > 0 && (
            <Badge variant="light" color="teal" size="sm" radius="md">
              Pool Share: {poolSharePercent.toFixed(2)}%
            </Badge>
          )}
        </Group>

        {/* 4 Stats Grid with identical media-aligned 38px icons */}
        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm" mb="md">
          {/* Available */}
          <Box className={classes.tile}>
            <Group gap="md" align="center" wrap="nowrap" w="100%">
              <Tooltip label="GoFundMeme Token ($GFM)" position="top">
                <div className={classes.tokenIcon}>
                  <Avatar src={tokenImage} size={36} radius="xl" />
                </div>
              </Tooltip>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text size="xs" tt="uppercase" fw={600} c="dimmed" lh={1.2}>
                  Available to Stake
                </Text>
                <Text fw={700} fz={20} lh={1.2} mt={2}>
                  {availableBalance.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                    notation: "compact",
                    compactDisplay: "short",
                  })}{" "}
                  <Text component="span" fz="xs" fw={700} c="dimmed">
                    $GFM
                  </Text>
                </Text>
                {!!availableUsd && (
                  <Text size="xs" c="dimmed" mt={1} lh={1.2}>
                    ~$
                    {availableUsd.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    USD
                  </Text>
                )}
              </Box>
            </Group>
          </Box>

          {/* Staked */}
          <Box className={classes.tile}>
            <Group gap="md" align="center" wrap="nowrap" w="100%">
              <Tooltip label="Staked GoFundMeme ($sGFM)" position="top">
                <div className={classes.tokenIcon}>
                  <Avatar src={stakedTokenImage} size={36} radius="xl" />
                </div>
              </Tooltip>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text size="xs" tt="uppercase" fw={600} c="dimmed" lh={1.2}>
                  Active Staked
                </Text>
                <Text fw={700} fz={20} lh={1.2} mt={2}>
                  {stakedBalance.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                    notation: "compact",
                    compactDisplay: "short",
                  })}{" "}
                  <Text component="span" fz="xs" fw={700} c="dimmed">
                    $sGFM
                  </Text>
                </Text>
                {!!stakedBalanceUsd && (
                  <Text size="xs" c="dimmed" mt={1} lh={1.2}>
                    ~$
                    {stakedBalanceUsd.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    USD
                  </Text>
                )}
              </Box>
            </Group>
          </Box>

          {/* Claimable Rewards */}
          <Box
            className={
              claimableRewards > 0 ? classes.tileHighlight : classes.tile
            }
          >
            <Group gap="md" align="center" wrap="nowrap" w="100%">
              <Tooltip label="Solana ($SOL)" position="top">
                <div className={classes.iconCircle}>
                  <SolanaLogo style={{ width: 20, height: 18 }} />
                </div>
              </Tooltip>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Group justify="space-between" align="center" gap={4}>
                  <Text size="xs" tt="uppercase" fw={600} c="dimmed" lh={1.2}>
                    Claimable Rewards
                  </Text>
                </Group>
                <Text
                  fw={700}
                  fz={20}
                  lh={1.2}
                  mt={2}
                  c={claimableRewards > 0 ? "teal" : undefined}
                >
                  {claimableRewards.toLocaleString("en-US", {
                    maximumFractionDigits: 4,
                  })}{" "}
                  <Text component="span" fz="xs" fw={700} c="dimmed">
                    SOL
                  </Text>
                </Text>
                {!!claimableUsd && (
                  <Text size="xs" c="dimmed" mt={1} lh={1.2}>
                    ~$
                    {claimableUsd.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    USD
                  </Text>
                )}
              </Box>
            </Group>
          </Box>

          {/* Lifetime Claimed */}
          <Box className={classes.tile}>
            <Group gap="md" align="center" wrap="nowrap" w="100%">
              <Tooltip label="Solana ($SOL)" position="top">
                <div className={classes.iconCircle}>
                  <SolanaLogo style={{ width: 20, height: 18 }} />
                </div>
              </Tooltip>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text size="xs" tt="uppercase" fw={600} c="dimmed" lh={1.2}>
                  Lifetime Claimed
                </Text>
                <Text fw={700} fz={20} lh={1.2} mt={2}>
                  {claimedRewards.toLocaleString("en-US", {
                    maximumFractionDigits: 4,
                  })}{" "}
                  <Text component="span" fz="xs" fw={700} c="dimmed">
                    SOL
                  </Text>
                </Text>
                {!!claimedUsd && (
                  <Text size="xs" c="dimmed" mt={1} lh={1.2}>
                    ~$
                    {claimedUsd.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}{" "}
                    USD
                  </Text>
                )}
              </Box>
            </Group>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Info banner */}
      <Box className={classes.infoBanner}>
        <Group gap="xs" wrap="nowrap" align="center">
          <IconShieldCheck
            size={20}
            color="var(--mantine-color-teal-6)"
            style={{ flexShrink: 0 }}
          />
          <Text size="xs" c="dimmed" lh={1.3}>
            Staked tokens are locked for 7 days, followed by a 7-day unstaking
            window every 14-day epoch. 100% of protocol fees are distributed in
            $SOL.
          </Text>
        </Group>
      </Box>
    </Box>
  );
};

export default AccountSummary;
