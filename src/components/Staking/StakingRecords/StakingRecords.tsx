import { Grid } from "@mantine/core";
import { getStakerStakeAccounts } from "../../../solana/staking/states";
import dayjs from "dayjs";
import StakingRecordsItem from "./StakingRecordsItem";
import { useMemo } from "react";

type Props = {
  list: NonNullable<
    Awaited<ReturnType<typeof getStakerStakeAccounts>>
  >["records"];
};

const StakingRecords = ({ list }: Props) => {
  const sorted = useMemo(() => {
    return [...list].sort(
      (a, b) =>
        dayjs(b.stakingTimestamp).unix() - dayjs(a.stakingTimestamp).unix()
    );
  }, [list]);

  return (
    <>
      <Grid justify="center" align="flex-start" gutter="xs">
        {sorted?.map((record) => (
          <Grid.Col
            span={{
              base: 12,
              xs: 6,
              md: 4,
            }}
            key={record?.record}
          >
            <StakingRecordsItem record={record} />
          </Grid.Col>
        ))}
      </Grid>
    </>
  );
};

export default StakingRecords;
