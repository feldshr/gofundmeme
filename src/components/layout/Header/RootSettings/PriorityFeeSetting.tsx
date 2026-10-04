import { Box, Group, NumberInput, Text } from "@mantine/core";
import SolanaLogo from "../../../img/SolanaLogo";
import { useRoot } from "../../../../services/hooks";
import { MIN_PRIORITY_FEE, PRIORITY_FEE_STEP } from "../../../../constants";

export const PriorityFeeSetting = () => {
  const { priorityFee, setPriorityFee } = useRoot();

  return (
    <Box>
      <Group wrap="nowrap" justify="space-between">
        <Text>Priority fee</Text>
        <NumberInput
          w={172}
          allowNegative={false}
          decimalScale={5}
          thousandSeparator=","
          placeholder={String(MIN_PRIORITY_FEE)}
          step={PRIORITY_FEE_STEP}
          min={MIN_PRIORITY_FEE}
          leftSection={
            <SolanaLogo color="var(--mantine-color-bright)" fontSize="14px" />
          }
          inputWrapperOrder={["label", "input", "description"]}
          value={priorityFee}
          onChange={(value) => {
            setPriorityFee(
              typeof value === "string" ? MIN_PRIORITY_FEE : value,
            );
          }}
        />
      </Group>
      <Text c="dimmed" size="xs" mt={4} lh={1.1}>
        Prioritizing the fee helps boost the transaction processing speed
        against others, resulting in faster confirmation time
      </Text>
    </Box>
  );
};
