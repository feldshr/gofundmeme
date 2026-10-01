import { Text, type TextProps } from "@mantine/core";
import type { TimeRemaining } from "../../types/basic";

type Props = {
  time: TimeRemaining;
  hideZeros?: boolean;
  inline?: boolean;
};

const TIME_UNITS: (keyof TimeRemaining)[] = [
  "months",
  "days",
  "hours",
  "minutes",
  "seconds",
];

const Timer = ({ time, hideZeros, inline, ...props }: Props & TextProps) => {
  const parts: string[] = [];
  for (const unit of TIME_UNITS) {
    const value = time[unit] ?? 0;
    if (unit === "months" && value === 0) continue;
    if (unit === "days" && value === 0) continue;
    if (hideZeros && unit === "hours" && value === 0) continue;
    parts.push(`${value}${unit.slice(0, 1)}`);
  }
  const label = parts.join(" ");

  return (
    <Text fz="inherit" fw={900} lh={1} inline={inline} {...props}>
      {label}
    </Text>
  );
};

export default Timer;
