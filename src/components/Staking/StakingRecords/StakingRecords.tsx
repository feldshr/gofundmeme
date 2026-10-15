import {
  Badge,
  Box,
  Grid,
  Group,
  SegmentedControl,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { getStakerStakeAccounts } from "../../../solana/staking";
import dayjs from "dayjs";
import StakingRecordsItem from "./StakingRecordsItem";
import { useMemo, useState } from "react";
import classes from "./StakingRecords.module.css";
import { IconCoins, IconListCheck } from "@tabler/icons-react";
import { useStaking } from "../context/StakingContext";
import {
  calculateRecordClaimableRewards,
  getRecordUnlockDetails,
} from "../utils";

type Props = {
  list: NonNullable<
    Awaited<ReturnType<typeof getStakerStakeAccounts>>
  >["records"];
};

const StakingRecords = ({ list }: Props) => {
  const { stakingInfo } = useStaking();
  const [filter, setFilter] = useState<string>("all");

  const sorted = useMemo(() => {
    return [...list].sort(
      (a, b) =>
        dayjs(b.stakingTimestamp).unix() - dayjs(a.stakingTimestamp).unix(),
    );
  }, [list]);

  const claimableCount = useMemo(() => {
    return sorted.filter((record) => {
      const claimable = calculateRecordClaimableRewards(
        record,
        stakingInfo?.cumulativeRewardsPerToken,
      );
      return claimable > 0;
    }).length;
  }, [sorted, stakingInfo?.cumulativeRewardsPerToken]);

  const unlockedCount = useMemo(() => {
    return sorted.filter((record) => {
      const unlock = getRecordUnlockDetails(record.stakingTimestamp);
      return unlock.unlockAvailable;
    }).length;
  }, [sorted]);

  const filteredRecords = useMemo(() => {
    if (filter === "claimable") {
      return sorted.filter((record) => {
        const claimable = calculateRecordClaimableRewards(
          record,
          stakingInfo?.cumulativeRewardsPerToken,
        );
        return claimable > 0;
      });
    }
    if (filter === "unlocked") {
      return sorted.filter((record) => {
        const unlock = getRecordUnlockDetails(record.stakingTimestamp);
        return unlock.unlockAvailable;
      });
    }
    return sorted;
  }, [sorted, filter, stakingInfo?.cumulativeRewardsPerToken]);

  const filterData = useMemo(() => {
    const data = [{ label: `All (${sorted.length})`, value: "all" }];
    if (claimableCount > 0) {
      data.push({ label: `Claimable (${claimableCount})`, value: "claimable" });
    }
    if (unlockedCount > 0) {
      data.push({ label: `Unlocked (${unlockedCount})`, value: "unlocked" });
    }
    return data;
  }, [sorted.length, claimableCount, unlockedCount]);

  if (sorted.length === 0) {
    return (
      <Box className={classes.emptyCard}>
        <Stack align="center" gap="sm">
          <ThemeIcon size={48} radius="xl" variant="light" color="gray">
            <IconCoins size={24} />
          </ThemeIcon>
          <Text fw={600} fz="md">
            No active staking positions
          </Text>
          <Text size="xs" c="dimmed" maw={360}>
            You haven't staked any $GFM yet. Enter an amount in the Stake form
            above to start earning a continuous share of protocol fees in $SOL.
          </Text>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Title and Optional Filter */}
      <Group justify="space-between" align="center" mb="md">
        <Group gap={8} align="center">
          <IconListCheck size={18} style={{ opacity: 0.7 }} />
          <Text fw={700} fz="md">
            Staking positions
          </Text>
          <Badge variant="light" color="teal" size="sm" radius="md">
            {sorted.length} {sorted.length === 1 ? "Position" : "Positions"}
          </Badge>
        </Group>

        {filterData.length > 1 && (
          <SegmentedControl
            size="xs"
            radius="md"
            value={filter}
            onChange={setFilter}
            data={filterData}
          />
        )}
      </Group>

      {/* Grid of records */}
      {filteredRecords.length === 0 ? (
        <Box className={classes.emptyCard}>
          <Text size="sm" c="dimmed">
            No positions match the selected filter.
          </Text>
        </Box>
      ) : (
        <Grid justify="flex-start" align="stretch" gutter="sm">
          {filteredRecords.map((record) => (
            <Grid.Col
              span={{
                base: 12,
                xs: 6,
                md: 4,
              }}
              key={record.record}
            >
              <StakingRecordsItem record={record} />
            </Grid.Col>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default StakingRecords;
