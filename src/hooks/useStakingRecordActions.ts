import { useContext, useState } from "react";
import { StakingContext, type StakerRecord } from "../services/StakingService";

export const useStakingRecordActions = (record: StakerRecord) => {
  const { handleClaim, handleUnstake } = useContext(StakingContext);

  const [isClaiming, setIsClaiming] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);

  const claim = async () => {
    setIsClaiming(true);
    try {
      await handleClaim(record);
    } catch (e) {
      console.error(e);
    } finally {
      setIsClaiming(false);
    }
  };

  const unstake = async () => {
    setIsUnstaking(true);
    try {
      await handleUnstake(record);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUnstaking(false);
    }
  };

  return {
    claim,
    unstake,
    isClaiming,
    isUnstaking,
  };
};
