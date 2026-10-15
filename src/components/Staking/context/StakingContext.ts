import { createContext, useContext } from "react";
import type {
  getStakerStakeAccounts,
  getStaking,
} from "../../../solana/staking/states";

export type StakerStakeAccounts = NonNullable<
  Awaited<ReturnType<typeof getStakerStakeAccounts>>
>["records"];
export type StakerRecord = StakerStakeAccounts extends (infer U)[] ? U : never;

export type StakingContextType = {
  stakingInfoLoading: boolean;
  stakingInfo?: Awaited<ReturnType<typeof getStaking>>;
  handleSync: () => Promise<void>;
  syncPending: boolean;
  handleClaim: (record: StakerRecord) => Promise<void>;
  handleUnstake: (record: StakerRecord) => Promise<void>;
};

export const StakingContext = createContext<StakingContextType | null>(null);

export const useStaking = () => {
  const context = useContext(StakingContext);
  if (!context) {
    throw new Error("useStaking must be used within a StakingProvider");
  }
  return context;
};

