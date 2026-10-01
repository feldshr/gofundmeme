import dayjs from "dayjs";
import {
  NETWORK,
  SOL_EXPLORERS,
  STAKING_DURATION,
  type ExplorerKey,
} from "./constants";
import type { TimeRemaining } from "./types/basic";
import type { UnlockInfo } from "./types/staking";

export const getExplorerLink = (explorerKey: ExplorerKey, value: string) => {
  const explorer = SOL_EXPLORERS[explorerKey];
  return `${explorer.href}tx/${value}?cluster=${NETWORK}`;
};

export const walletAddressToShorten = (walletAddress?: string) => {
  if (!walletAddress) return "";
  if (walletAddress.length < 8) return walletAddress;
  return `${walletAddress.slice(0, 4)}..${walletAddress.slice(-4)}`;
};

export const calculateTimeRemaining = (
  targetDate: Date,
): TimeRemaining | undefined => {
  const currentTime = new Date().getTime();
  const difference = targetDate.getTime() - currentTime;

  if (difference <= 0) {
    return undefined;
  }

  const months = Math.floor(difference / (1000 * 60 * 60 * 24 * 30));
  const days = Math.floor(
    (difference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24),
  );
  const hours = Math.floor(
    (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);
  return { months, days, hours, minutes, seconds };
};

export function getUnlockInfo(stakeDate: Date): UnlockInfo {
  // Текущий момент и момент начала стейка с использованием dayjs
  const now = dayjs();
  const start = dayjs(stakeDate);

  // Общее прошедшее время с момента стейка (в миллисекундах)
  const elapsedMs = now.diff(start, "millisecond");

  // Вычисляем количество полных циклов, прошедших с момента стейка
  const completedCycles = Math.floor(elapsedMs / STAKING_DURATION.full);

  // Начало текущего цикла
  const currentCycleStart = start.add(
    completedCycles * STAKING_DURATION.full,
    "millisecond",
  );

  // Время, прошедшее в рамках текущего цикла
  const cycleElapsedMs = now.diff(currentCycleStart, "millisecond");

  // Если мы находимся в периоде блокировки, то unlockAvailable = false,
  // и следующий переход наступит по окончании lockDurationMs текущего цикла.
  // Иначе — мы в периоде разблокировки, и следующий переход наступит по окончании всего цикла.
  if (cycleElapsedMs < STAKING_DURATION.lock) {
    const nextTransition = currentCycleStart
      .add(STAKING_DURATION.lock, "millisecond")
      .toDate();
    return {
      unlockAvailable: false,
      date: nextTransition,
    };
  } else {
    const nextTransition = currentCycleStart
      .add(STAKING_DURATION.full, "millisecond")
      .toDate();
    return {
      unlockAvailable: true,
      date: nextTransition,
    };
  }
}
