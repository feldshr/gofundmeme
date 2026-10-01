import { Avatar, Group, Text, rem } from "@mantine/core";
import { useMemo } from "react";
import tokenImage from "../../../assets/GFM.png";
import stakedTokenImage from "../../../assets/sGFM.png";
import { IconPhotoOff } from "@tabler/icons-react";
import SolanaLogo from "../../img/SolanaLogo";

const CLAIMED_REWARDS_DIVISOR = 1000;

type AccountSummaryProps = {
  availableBalance?: number;
  stakedBalance?: number;
  claimedRewards?: number;
  gfmRate?: number;
  solRate?: number;
};

const AccountSummary = ({
  availableBalance,
  stakedBalance,
  claimedRewards,
  gfmRate,
  solRate,
}: AccountSummaryProps) => {
  const availableUsd = useMemo(() => {
    if (!availableBalance || !gfmRate) return;
    return availableBalance * gfmRate;
  }, [availableBalance, gfmRate]);

  const stakedBalanceUsd = useMemo(() => {
    if (!stakedBalance || !gfmRate) return;
    return stakedBalance * gfmRate;
  }, [stakedBalance, gfmRate]);

  const claimedUsd = useMemo(() => {
    if (!claimedRewards || !solRate) return;
    return (claimedRewards / CLAIMED_REWARDS_DIVISOR) * solRate;
  }, [claimedRewards, solRate]);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "space-around",
        textAlign: "center",
        gap: "var(--mantine-spacing-lg)",
      }}
    >
      <div>
        <Text tt="uppercase" size="xs" c="dimmed">
          Available
        </Text>
        <Group align="center" justify="center" gap={4}>
          <Avatar
            variant="transparent"
            radius={20}
            src={tokenImage}
            display="inline-flex"
            style={{
              align: "center",
              justifyContent: "center",
            }}
            size={20}
          >
            <IconPhotoOff size={16} />
          </Avatar>
          <Text lh={1} fw={600} fz={24}>
            {(availableBalance || 0)?.toLocaleString("en-US", {
              maximumFractionDigits: 2,
              notation: "compact",
              compactDisplay: "short",
            })}
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
      <div>
        <Text tt="uppercase" size="xs" c="dimmed">
          Staked
        </Text>
        <Group align="center" justify="center" gap={4}>
          <Avatar
            variant="transparent"
            radius={20}
            src={stakedTokenImage}
            size={20}
            display="inline-flex"
            style={{
              align: "center",
              justifyContent: "center",
            }}
          >
            <IconPhotoOff size={16} />
          </Avatar>
          <Text lh={1} fw={600} fz={24}>
            {(stakedBalance || 0)?.toLocaleString("en-US", {
              maximumFractionDigits: 2,
              notation: "compact",
              compactDisplay: "short",
            })}
          </Text>
        </Group>
        {!!stakedBalanceUsd && (
          <>
            {" "}
            <Text size="xs" c="dimmed">
              ~$
              {stakedBalanceUsd?.toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })}
            </Text>
          </>
        )}
      </div>
      <div>
        <Text tt="uppercase" size="xs" c="dimmed">
          Claimed
        </Text>
        <Text lh={1} fw={600} fz={24}>
          <SolanaLogo
            fontSize="16px"
            style={{
              marginRight: rem(6),
            }}
          />
          {(claimedRewards || 0 / CLAIMED_REWARDS_DIVISOR)?.toLocaleString(
            "en-US",
            {
              maximumFractionDigits: 2,
            }
          )}
        </Text>
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
    </div>
  );
};

export default AccountSummary;
