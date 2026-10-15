import {
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  NumberFormatter,
  SimpleGrid,
  Text,
  Tooltip,
} from "@mantine/core";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useRoot } from "../../../providers/hooks";
import stakedTokenImage from "../../../assets/sGFM.png";
import { useStaking, type StakerRecord } from "../context/StakingContext";
import { useStakingRecordActions } from "../hooks/useStakingRecordActions";
import SolanaLogo from "../../img/SolanaLogo";
import { DATE_FORMAT } from "../../../solana";
import {
  calculateRecordClaimableRewards,
  getRecordUnlockDetails,
} from "../utils";
import classes from "./StakingRecords.module.css";
import { IconClock, IconLock, IconLockOpen } from "@tabler/icons-react";

type Props = {
  record: StakerRecord;
};

const StakingRecordsItem = ({ record }: Props) => {
  const { gfmRate, solRate } = useRoot();
  const { stakingInfo } = useStaking();
  const { claim, unstake, isClaiming, isUnstaking } =
    useStakingRecordActions(record);

  const unlock = useMemo(() => {
    return getRecordUnlockDetails(record.stakingTimestamp);
  }, [record.stakingTimestamp]);

  const available = useMemo(() => {
    return calculateRecordClaimableRewards(
      record,
      stakingInfo?.cumulativeRewardsPerToken,
    );
  }, [record, stakingInfo?.cumulativeRewardsPerToken]);

  const stakedBalanceUsd = useMemo(() => {
    if (!record?.userStakedTokens || !gfmRate) return;
    return record.userStakedTokens * gfmRate;
  }, [record?.userStakedTokens, gfmRate]);

  const claimedUsd = useMemo(() => {
    if (!record?.claimedRewards || !solRate) return;
    return record.claimedRewards * solRate;
  }, [record?.claimedRewards, solRate]);

  const availableUsd = useMemo(() => {
    if (!available || !solRate) return;
    return available * solRate;
  }, [available, solRate]);

  const cooldownActive = useMemo(() => {
    if (!record?.lastClaimedTimestamp) return false;
    return dayjs().isBefore(
      dayjs(record.lastClaimedTimestamp).add(1, "minute"),
    );
  }, [record?.lastClaimedTimestamp]);

  return (
    <Box className={classes.card}>
      <Box>
        <Group justify="space-between" align="flex-start">
          {/* Staked Tokens amount */}
          <Group gap="sm" align="center">
            <Tooltip label="Staked GoFundMeme ($sGFM)" position="top">
              <Avatar
                src={stakedTokenImage}
                size={32}
                radius="xl"
                style={{
                  flexShrink: 0,
                  border:
                    "1px solid light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))",
                }}
              />
            </Tooltip>
            <Box>
              <Text fw={700} fz={20} lh={1.1}>
                <NumberFormatter
                  value={record.userStakedTokens}
                  thousandSeparator
                  decimalScale={4}
                />{" "}
                <Text component="span" fz="xs" fw={700} c="dimmed">
                  $GFM
                </Text>
              </Text>
              {!!stakedBalanceUsd && (
                <Text size="xs" c="dimmed">
                  ~$
                  {stakedBalanceUsd.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  USD
                </Text>
              )}
            </Box>
          </Group>
          {unlock.unlockAvailable ? (
            <Badge
              color="teal"
              variant="light"
              size="sm"
              radius="md"
              leftSection={<IconLockOpen size={12} />}
            >
              Unlocked
            </Badge>
          ) : (
            <Badge
              color="red"
              variant="light"
              size="sm"
              radius="md"
              leftSection={<IconLock size={12} />}
            >
              Locked
            </Badge>
          )}
        </Group>

        {/* Rewards Box */}
        <Box
          className={
            available > 0 ? classes.rewardBoxActive : classes.rewardBox
          }
          my="xs"
        >
          <SimpleGrid cols={2} spacing="xs">
            <div>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed">
                Claimable SOL
              </Text>
              <Group gap={4} align="center" mt={2}>
                <SolanaLogo style={{ width: 14, height: 12 }} />
                <Text
                  fw={700}
                  fz="md"
                  lh={1.2}
                  c={available > 0 ? "teal" : undefined}
                >
                  <NumberFormatter
                    value={available}
                    decimalScale={4}
                    thousandSeparator
                  />
                </Text>
              </Group>
              {!!availableUsd && (
                <Text size="xs" c="dimmed">
                  ~$
                  {availableUsd.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                </Text>
              )}
            </div>

            <div>
              <Text size="xs" tt="uppercase" fw={600} c="dimmed">
                Claimed SOL
              </Text>
              <Group gap={4} align="center" mt={2}>
                <SolanaLogo style={{ width: 14, height: 12 }} />
                <Text fw={600} fz="md" lh={1.2}>
                  <NumberFormatter
                    value={record.claimedRewards}
                    decimalScale={4}
                    thousandSeparator
                  />
                </Text>
              </Group>
              {!!claimedUsd && (
                <Text size="xs" c="dimmed">
                  ~$
                  {claimedUsd.toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                </Text>
              )}
            </div>
          </SimpleGrid>
        </Box>

        {/* Timeline details */}
        <Group gap={4} align="flex-start" mt="xs" wrap="nowrap">
          <IconClock size={14} style={{ opacity: 0.6 }} />
          <Text size="xs" c="dimmed">
            {unlock.unlockAvailable ? "Unstake window closes on" : "Unlocks on"}{" "}
            {dayjs(unlock.date).format(DATE_FORMAT)}
          </Text>
        </Group>
      </Box>

      {/* Action Buttons */}
      <Group gap="xs" mt="md" grow>
        <Tooltip
          label={
            !unlock.unlockAvailable
              ? `Locked until ${dayjs(unlock.date).format(DATE_FORMAT)}`
              : "Unstake your tokens back to your wallet"
          }
        >
          <Button
            color="red"
            variant="light"
            radius="md"
            size="sm"
            disabled={!unlock.unlockAvailable || isClaiming}
            loading={isUnstaking}
            onClick={unstake}
            fw={600}
          >
            Unstake
          </Button>
        </Tooltip>

        <Tooltip
          label={
            available <= 0
              ? "No rewards accumulated yet"
              : cooldownActive
                ? "Please wait 1 minute between claims"
                : "Claim your accumulated SOL rewards"
          }
        >
          <Button
            color="teal"
            variant={available > 0 ? "filled" : "light"}
            radius="md"
            size="sm"
            disabled={available <= 0 || isUnstaking || cooldownActive}
            loading={isClaiming}
            onClick={claim}
            leftSection={<SolanaLogo fontSize="13px" />}
            fw={600}
          >
            Claim SOL
          </Button>
        </Tooltip>
      </Group>
    </Box>
  );
};

export default StakingRecordsItem;
