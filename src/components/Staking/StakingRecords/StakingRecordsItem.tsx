import {
  Avatar,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  NumberFormatter,
  Text,
  Title,
} from "@mantine/core";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useRoot, useStaking } from "../../../services/hooks";
import stakedTokenImage from "../../../assets/sGFM.png";
import type { StakerRecord } from "../../../services/StakingService";
import { useStakingRecordActions } from "../../../hooks/useStakingRecordActions";
import { getUnlockInfo } from "../../../utils";
import SolanaLogo from "../../img/SolanaLogo";
import { DATE_FORMAT } from "../../../constants";

type Props = {
  record: StakerRecord;
};

const scalingFactor = 1_000_000_000;
const StakingRecordsItem = ({ record }: Props) => {
  const { gfmRate, solRate } = useRoot();
  const { stakingInfo } = useStaking();
  const { claim, unstake, isClaiming, isUnstaking } =
    useStakingRecordActions(record);

  const unlock = useMemo(() => {
    return getUnlockInfo(record?.stakingTimestamp);
  }, [record?.stakingTimestamp]);

  const available = useMemo(() => {
    if (!stakingInfo || !record) return 0;
    return (
      (record.userStakedTokens *
        (stakingInfo?.cumulativeRewardsPerToken -
          record.userCumulativeRewardsPerToken)) /
      scalingFactor
    );
  }, [record, stakingInfo]);

  const stakedBalanceUsd = useMemo(() => {
    if (!record?.userStakedTokens || !gfmRate) return;
    return record?.userStakedTokens * gfmRate;
  }, [record?.userStakedTokens, gfmRate]);

  const claimedUsd = useMemo(() => {
    if (!record?.claimedRewards || !solRate) return;
    return record?.claimedRewards * solRate;
  }, [record?.claimedRewards, solRate]);

  const availableUsd = useMemo(() => {
    if (!available || !solRate) return;
    return available * solRate;
  }, [available, solRate]);

  return (
    <Card shadow="xs" p={{ base: "xs", xs: "sm" }} radius="md" withBorder>
      <Flex wrap="wrap" align="center" justify="space-around" ta="center">
        <div style={{ width: "100%" }}>
          <Text tt="uppercase" size="xs" c="dimmed">
            Staked
          </Text>
          <Group align="center" justify="center" gap={6}>
            <Avatar
              variant="transparent"
              radius={20}
              size={20}
              src={stakedTokenImage}
              display="inline-flex"
              style={{
                align: "center",
                justifyContent: "center",
              }}
            />
            <Title order={2} lh={1}>
              <NumberFormatter
                value={record?.userStakedTokens}
                thousandSeparator
                decimalScale={6}
              />
            </Title>
          </Group>
          {!!stakedBalanceUsd && (
            <>
              {" "}
              <Text size="sm" c="dimmed">
                ~$
                {stakedBalanceUsd?.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}
              </Text>
            </>
          )}
        </div>
        <Divider w="100%" my={{ base: "xs", xs: "sm" }} label="rewards" />
        <div>
          <Text tt="uppercase" size="xs" c="dimmed">
            Claimed
          </Text>
          <Group align="center" justify="center" gap={4}>
            <SolanaLogo fontSize="16" color="var(--mantine-color-bright)" />
            <Text fz={22} fw={600} lh={1}>
              <NumberFormatter
                value={record?.claimedRewards}
                decimalScale={2}
                thousandSeparator
              />
            </Text>
          </Group>
          {!!claimedUsd && (
            <>
              {" "}
              <Text size="xs" c="dimmed">
                ~$
                {claimedUsd?.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}
              </Text>
            </>
          )}
        </div>
        <div>
          <Text tt="uppercase" size="xs" c="dimmed">
            Available
          </Text>
          <Group align="center" justify="center" gap={4}>
            <SolanaLogo fontSize="16" color="var(--mantine-color-bright)" />
            <Text fz={22} fw={600} lh={1}>
              <NumberFormatter
                value={available}
                decimalScale={6}
                thousandSeparator
              />
            </Text>
          </Group>
          {!!availableUsd && (
            <>
              {" "}
              <Text size="xs" c="dimmed">
                ~$
                {availableUsd?.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}
              </Text>
            </>
          )}
        </div>
      </Flex>
      <Group wrap="nowrap" gap={4} mt="lg">
        <Button
          color="red"
          variant="light"
          disabled={!unlock?.unlockAvailable || isClaiming}
          loading={isUnstaking}
          onClick={unstake}
          fullWidth
        >
          unstake
        </Button>
        <Button
          color="green"
          disabled={available <= 0 || isUnstaking}
          loading={isClaiming}
          onClick={claim}
          fullWidth
        >
          claim
        </Button>
      </Group>
      <Text c="dimmed" size="xs" lh={1} mt={4}>
        {unlock?.unlockAvailable
          ? "Unstake available until"
          : "Unstake will be available after"}{" "}
        {dayjs(unlock?.date).format(DATE_FORMAT)}
        {unlock?.unlockAvailable ? "" : " for 7 days"}
      </Text>
    </Card>
  );
};

export default StakingRecordsItem;
