import {
  Avatar,
  Box,
  Button,
  Flex,
  Group,
  NumberFormatter,
  Progress,
  SimpleGrid,
  Skeleton,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconClock,
  IconInfoCircle,
  IconRefresh,
  IconUsersGroup,
} from "@tabler/icons-react";
import classes from "./StakingStats.module.css";
import { useRoot } from "../../../providers/hooks";
import { useStaking } from "../context/StakingContext";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import Timer from "../../Timer/Timer";
import type { TimeRemaining } from "../../../types/basic";
import { calculateTimeRemaining } from "../../../utils";
import SolanaLogo from "../../img/SolanaLogo";
import tokenImage from "../../../assets/GFM.png";

const StakingStats = () => {
  const { solRate, gfmRate } = useRoot();
  const { stakingInfo, stakingInfoLoading, syncPending, handleSync } =
    useStaking();

  const stakedPercent = useMemo(() => {
    if (!stakingInfo || !stakingInfo.gfmToken?.supply) return 0;
    return (stakingInfo.totalStakedTokens / stakingInfo.gfmToken.supply) * 100;
  }, [stakingInfo]);

  const [timeRemaining, setTimeRemaining] = useState<
    TimeRemaining | undefined | null
  >();

  const totalFeesUsd = useMemo(() => {
    if (!solRate || !stakingInfo?.totalRewards) return;
    return stakingInfo.totalRewards * solRate;
  }, [solRate, stakingInfo?.totalRewards]);

  const stakedUsd = useMemo(() => {
    if (!gfmRate || !stakingInfo?.totalStakedTokens) return;
    return stakingInfo.totalStakedTokens * gfmRate;
  }, [gfmRate, stakingInfo?.totalStakedTokens]);

  const pendingRewards = stakingInfo?.balance?.pendingRewards || 0;
  const canSync = !timeRemaining && pendingRewards >= 2;

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (typeof stakingInfo === "undefined") {
      setTimeRemaining(undefined);
      return;
    }
    const targetDate = dayjs(stakingInfo?.lastNetworkSync).add(1, "hours");
    if (dayjs().isBefore(targetDate)) {
      setTimeRemaining(calculateTimeRemaining(targetDate.toDate()));
      timer = setInterval(() => {
        if (dayjs().isBefore(targetDate)) {
          setTimeRemaining(calculateTimeRemaining(targetDate.toDate()));
        } else {
          setTimeRemaining(null);
          clearInterval(timer);
        }
      }, 1000);
    } else {
      setTimeRemaining(null);
    }
    return () => clearInterval(timer);
  }, [stakingInfo]);

  return (
    <Box className={classes.container}>
      <div className={classes.ambientGlow} />

      {/* Header section with live pool status & sync action */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        gap="xs"
        mb="md"
      >
        <Box>
          <Group gap={8} align="center">
            <Text fw={700} fz="lg" lh={1.2}>
              Protocol staking pool
            </Text>
            <div className={classes.liveBadge}>
              <span className={classes.liveDot} />
              LIVE
            </div>
          </Group>
          <Text size="xs" c="dimmed" mt={2}>
            Platform fees are continuously collected and distributed to stakers
            in $SOL
          </Text>
        </Box>

        {/* Sync status / action */}
        <Group gap="xs" align="center">
          {canSync ? (
            <Button
              size="xs"
              radius="xl"
              variant="gradient"
              gradient={{ from: "teal", to: "cyan", deg: 90 }}
              leftSection={<IconRefresh size={14} />}
              loading={syncPending}
              onClick={handleSync}
              fw={600}
            >
              Sync Pool (
              {pendingRewards.toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}{" "}
              SOL)
            </Button>
          ) : (
            <Tooltip
              label="Pool rewards are synchronized to stakers every hour once pending fees reach 2 SOL."
              position="bottom-end"
            >
              <Group
                gap={6}
                px="sm"
                py={4}
                style={{
                  borderRadius: 9999,
                  backgroundColor:
                    "light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-6))",
                  border:
                    "1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))",
                  cursor: "help",
                }}
              >
                <IconClock size={13} style={{ opacity: 0.7 }} />
                <Text size="xs" c="dimmed" fw={500}>
                  {timeRemaining ? (
                    <>
                      Next sync: <Timer time={timeRemaining} inline />
                    </>
                  ) : pendingRewards < 2 ? (
                    `Sync ready at 2 SOL (${pendingRewards.toFixed(2)}/2)`
                  ) : (
                    "Syncing ready"
                  )}
                </Text>
              </Group>
            </Tooltip>
          )}
        </Group>
      </Flex>

      {/* Main pool metrics with media-aligned 38px icons */}
      <SimpleGrid cols={{ base: 1, xs: 3 }} spacing="sm">
        {/* Total Value Staked */}
        <Box className={classes.statTile}>
          <Group gap="md" align="center" wrap="nowrap" w="100%">
            <Tooltip label="GoFundMeme Token ($GFM)" position="top">
              <div className={classes.tokenIcon}>
                <Avatar src={tokenImage} size={36} radius="xl" />
              </div>
            </Tooltip>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed" lh={1.2}>
                Total Staked
              </Text>
              <Skeleton visible={stakingInfoLoading} mt={2}>
                <Text fw={700} fz={20} lh={1.2}>
                  {stakingInfo?.totalStakedTokens?.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                    notation: "compact",
                    compactDisplay: "short",
                  })}{" "}
                  <Text component="span" fz="xs" fw={700} c="dimmed">
                    $GFM
                  </Text>
                </Text>
              </Skeleton>
              {!!stakedUsd && (
                <Skeleton visible={stakingInfoLoading} mt={2}>
                  <Text size="xs" c="dimmed" lh={1.2}>
                    ~$
                    {stakedUsd.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                      notation: "compact",
                      compactDisplay: "short",
                    })}{" "}
                    USD
                  </Text>
                </Skeleton>
              )}
            </Box>
          </Group>
        </Box>

        {/* Total SOL Fees Distributed */}
        <Box className={classes.statTile}>
          <Group gap="md" align="center" wrap="nowrap" w="100%">
            <Tooltip label="Solana ($SOL)" position="top">
              <div className={classes.iconCircle}>
                <SolanaLogo style={{ width: 20, height: 18 }} />
              </div>
            </Tooltip>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed" lh={1.2}>
                Total Rewards
              </Text>
              <Skeleton visible={stakingInfoLoading} mt={2}>
                <Text fw={700} fz={20} lh={1.2}>
                  {stakingInfo?.totalRewards?.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  <Text component="span" fz="xs" fw={700} c="dimmed">
                    SOL
                  </Text>
                </Text>
              </Skeleton>
              {!!totalFeesUsd && (
                <Skeleton visible={stakingInfoLoading} mt={2}>
                  <Text size="xs" c="dimmed" lh={1.2}>
                    ~$
                    {totalFeesUsd.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                      notation: "compact",
                      compactDisplay: "short",
                    })}{" "}
                    USD
                  </Text>
                </Skeleton>
              )}
            </Box>
          </Group>
        </Box>

        {/* Unique Stakers Count */}
        <Box className={classes.statTile}>
          <Group gap="md" align="center" wrap="nowrap" w="100%">
            <Tooltip label="Protocol Stakers" position="top">
              <div className={classes.iconCircle}>
                <IconUsersGroup size={20} stroke={1.5} />
              </div>
            </Tooltip>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed" lh={1.2}>
                Unique Stakers
              </Text>
              <Skeleton visible={stakingInfoLoading} mt={2}>
                <Text fw={700} fz={20} lh={1.2}>
                  <NumberFormatter
                    value={stakingInfo?.stakersCount}
                    thousandSeparator
                  />{" "}
                  <Text component="span" fz="xs" fw={700} c="dimmed">
                    Holders
                  </Text>
                </Text>
              </Skeleton>
              <Text size="xs" c="dimmed" mt={2} lh={1.2}>
                Participating community
              </Text>
            </Box>
          </Group>
        </Box>
      </SimpleGrid>

      {/* Circulating Supply Staked Progress Bar */}
      <Box mt="md">
        <Skeleton visible={stakingInfoLoading}>
          <Group justify="space-between" mb={6} align="center">
            <Group gap={4} align="center">
              <Text size="xs" fw={600}>
                Circulating supply staked
              </Text>
              <Tooltip
                label="Percentage of total circulating GFM tokens currently locked in the staking pool"
                position="top"
              >
                <IconInfoCircle
                  size={13}
                  style={{ opacity: 0.6, cursor: "help" }}
                />
              </Tooltip>
            </Group>
            <Text size="xs" fw={700} c="teal">
              <NumberFormatter
                value={stakedPercent}
                decimalScale={2}
                suffix="%"
              />
            </Text>
          </Group>

          <Progress
            value={stakedPercent}
            color="teal"
            size="md"
            radius="xl"
            animated
          />

          <Group justify="space-between" mt={6} align="center">
            <Text size="xs" c="dimmed">
              {stakingInfo?.totalStakedTokens?.toLocaleString("en-US", {
                maximumFractionDigits: 2,
                notation: "compact",
                compactDisplay: "short",
              })}{" "}
              /{" "}
              {stakingInfo?.gfmToken?.supply?.toLocaleString("en-US", {
                maximumFractionDigits: 2,
                notation: "compact",
                compactDisplay: "short",
              })}{" "}
              $GFM
            </Text>
            <Group gap={4} align="center">
              <Text size="xs" c="dimmed">
                Pending pool:
              </Text>
              <SolanaLogo style={{ width: 10 }} />
              <Text size="xs" fw={600}>
                {pendingRewards.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}{" "}
                SOL
              </Text>
            </Group>
          </Group>
        </Skeleton>
      </Box>
    </Box>
  );
};

export default StakingStats;
