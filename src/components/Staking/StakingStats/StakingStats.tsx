import {
  Box,
  Button,
  Flex,
  Group,
  NumberFormatter,
  Progress,
  rem,
  Skeleton,
  Text,
} from "@mantine/core";
import { IconUsersGroup } from "@tabler/icons-react";
import classes from "./StakingStats.module.css";
import { useRoot, useStaking } from "../../../services/hooks";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import Timer from "../../Timer/Timer";
import type { TimeRemaining } from "../../../types/basic";
import { calculateTimeRemaining } from "../../../utils";
import SolanaLogo from "../../img/SolanaLogo";

const StakingStats = () => {
  const { solRate, gfmRate } = useRoot();
  const { stakingInfo, stakingInfoLoading, syncPending, handleSync } =
    useStaking();
  const stakedPercent = useMemo(() => {
    if (!stakingInfo) return 0;
    return (
      (stakingInfo?.totalStakedTokens / stakingInfo?.gfmToken?.supply) * 100
    );
  }, [stakingInfo]);
  const [timeRemaining, setTimeRemaining] = useState<
    TimeRemaining | undefined | null
  >();
  const totalFeesUsd = useMemo(() => {
    if (!solRate || !stakingInfo?.totalRewards) return;
    return stakingInfo?.totalRewards * solRate;
  }, [solRate, stakingInfo?.totalRewards]);

  const stakedUsd = useMemo(() => {
    if (!gfmRate || !stakingInfo?.totalStakedTokens) return;
    return stakingInfo?.totalStakedTokens * gfmRate;
  }, [gfmRate, stakingInfo?.totalStakedTokens]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (typeof stakingInfo === "undefined") {
      setTimeRemaining(undefined);
      return;
    }
    const targetDate = dayjs(stakingInfo?.lastNetworkSync).add(1, "hours");
    if (dayjs().isBefore(targetDate)) {
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
    <Box
      style={{
        border: "1px solid var(--mantine-color-gray-7)",
        borderRadius: rem(8),
        boxShadow: "var(--mantine-color-gray-7) -3px 3px 0px",
      }}
      p="md"
    >
      <Flex
        align="flex-start"
        justify="space-around"
        gap="xs"
        wrap="wrap"
        ta="center"
        mb="lg"
      >
        <Box>
          <Text size="xs" tt="uppercase" mb={4} c="dimmed">
            Unique stakers
          </Text>
          <Skeleton visible={stakingInfoLoading}>
            <Text className={classes.value}>
              <IconUsersGroup
                size="16px"
                style={{
                  marginRight: rem(6),
                  verticalAlign: "middle",
                }}
                stroke={1.5}
              />
              <NumberFormatter
                value={stakingInfo?.stakersCount}
                thousandSeparator
              />
            </Text>
          </Skeleton>
        </Box>
        <Box>
          <Text size="xs" tt="uppercase" mb={4} c="dimmed">
            Total fees
          </Text>
          <Skeleton visible={stakingInfoLoading}>
            <Text className={classes.value}>
              <SolanaLogo
                fontSize="16px"
                style={{
                  marginRight: rem(6),
                }}
              />
              {stakingInfo?.totalRewards?.toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}
            </Text>
          </Skeleton>
          {totalFeesUsd && (
            <Text size="xs" tt="uppercase" c="dimmed" ml={4}>
              {" "}
              ~$
              {totalFeesUsd?.toLocaleString("en-US", {
                notation: "standard",
                maximumFractionDigits: 2,
              })}
            </Text>
          )}
        </Box>
        <Box>
          <Text size="xs" tt="uppercase" mb={4} c="dimmed">
            Pending fees
          </Text>
          <Skeleton visible={stakingInfoLoading}>
            <Text size="inherit" fw={600} className={classes.value}>
              <SolanaLogo
                fontSize="16px"
                style={{
                  marginRight: rem(6),
                }}
              />
              <NumberFormatter
                value={
                  (stakingInfo?.balance?.pendingRewards || 0) > 0.01
                    ? stakingInfo?.balance?.pendingRewards
                    : 0
                }
                thousandSeparator
                decimalScale={2}
              />
            </Text>
          </Skeleton>
        </Box>
      </Flex>
      <Box mt="md">
        <Skeleton visible={stakingInfoLoading}>
          <Group justify="space-between">
            <Text fz="xs">
              <Text component="span" fw={600}>
                {stakingInfo?.totalStakedTokens?.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                  notation: "compact",
                  compactDisplay: "short",
                })}
              </Text>{" "}
              {!!stakedUsd && (
                <>
                  ~$
                  {stakedUsd?.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                    notation: "compact",
                    compactDisplay: "short",
                  })}{" "}
                </>
              )}
              (
              <NumberFormatter
                value={stakedPercent}
                decimalScale={2}
                suffix="%"
              />
              )
            </Text>
            <Text fw={600}>
              {stakingInfo?.gfmToken?.supply?.toLocaleString("en-US", {
                maximumFractionDigits: 2,
                notation: "compact",
                compactDisplay: "short",
              })}
            </Text>
          </Group>
          <Progress value={stakedPercent} color="green" striped animated />
        </Skeleton>
      </Box>
      <Button
        mt="xs"
        fullWidth
        tt="uppercase"
        fw={700}
        disabled={
          !!timeRemaining || (stakingInfo?.balance?.pendingRewards || 0) < 2
        }
        loading={typeof timeRemaining === "undefined" || syncPending}
        onClick={handleSync}
      >
        {timeRemaining ? (
          <Timer
            time={timeRemaining}
            inline
            lh="var(--text-lh, var(--mantine-line-height-md))"
          />
        ) : (stakingInfo?.balance?.pendingRewards || 0) < 2 ? (
          "Sync soon"
        ) : (
          "Sync now"
        )}
      </Button>
      <Text fz="xs" mt={4} c="dimmed">
        Minimum pending rewards to sync: 2 $SOL
      </Text>
    </Box>
  );
};

export default StakingStats;
