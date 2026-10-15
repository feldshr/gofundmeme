import { Space } from "@mantine/core";
import { StakingProvider } from "./context/StakingProvider";
import StakingStats from "./StakingStats/StakingStats";
import StakingAccount from "./StakingAccount/StakingAccount";

const Staking = () => {
  return (
    <StakingProvider>
      <StakingStats />
      <Space h="md" />
      <StakingAccount />
    </StakingProvider>
  );
};

export default Staking;
