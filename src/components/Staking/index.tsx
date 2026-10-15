import { Stack } from "@mantine/core";
import { StakingProvider } from "./context/StakingProvider";
import StakingStats from "./StakingStats/StakingStats";
import StakingAccount from "./StakingAccount/StakingAccount";

const Staking = () => {
  return (
    <StakingProvider>
      <Stack gap="lg">
        <StakingStats />
        <StakingAccount />
      </Stack>
    </StakingProvider>
  );
};

export default Staking;
