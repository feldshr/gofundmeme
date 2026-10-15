import dayjs from "dayjs";
import type { StakerRecord } from "./context/StakingContext";
import { getUnlockInfo } from "../../utils";

export const REWARD_SCALING_FACTOR = 1_000_000_000;

/**
 * Calculates claimable SOL rewards for a given staker record
 */
export const calculateRecordClaimableRewards = (
  record?: StakerRecord,
  cumulativeRewardsPerToken?: number,
): number => {
  if (!record || cumulativeRewardsPerToken === undefined) return 0;
  const diff = cumulativeRewardsPerToken - record.userCumulativeRewardsPerToken;
  if (diff <= 0) return 0;
  return (record.userStakedTokens * diff) / REWARD_SCALING_FACTOR;
};

/**
 * Provides human-readable unlock timing info for a staking record
 */
export const getRecordUnlockDetails = (stakeDate: Date) => {
  const unlock = getUnlockInfo(stakeDate);
  const now = dayjs();
  const target = dayjs(unlock.date);

  const diffHoursTotal = Math.max(0, target.diff(now, "hour"));
  const diffDays = Math.floor(diffHoursTotal / 24);
  const diffHours = diffHoursTotal % 24;

  let remainingText = "";
  if (diffDays > 0) {
    remainingText = `${diffDays}d ${diffHours}h`;
  } else if (diffHoursTotal > 0) {
    const diffMinutes = Math.max(0, target.diff(now, "minute")) % 60;
    remainingText = `${diffHoursTotal}h ${diffMinutes}m`;
  } else {
    remainingText = "few moments";
  }

  return {
    ...unlock,
    diffDays,
    diffHours,
    diffHoursTotal,
    remainingText,
  };
};

