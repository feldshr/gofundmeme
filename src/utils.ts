import dayjs from "dayjs";
import {
  NETWORK,
  PUBLIC_RPC_URL,
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

export const checkIsValidUrl = (url: string): boolean => {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url.trim());
    const isHttp = parsed.protocol === "https:" || parsed.protocol === "http:";
    const hasHostname = Boolean(parsed.hostname);
    return isHttp && hasHostname;
  } catch {
    return false;
  }
};

export const getActiveRpc = (): string => {
  try {
    const rpcType = localStorage.getItem("rpcType");
    const customRpc = localStorage.getItem("customRpc");
    const parsedType = rpcType ? JSON.parse(rpcType) : "public";
    const parsedCustom = customRpc ? JSON.parse(customRpc) : "";

    if (parsedType === "custom" && parsedCustom && checkIsValidUrl(parsedCustom)) {
      return parsedCustom.trim();
    }
  } catch {
    // fallback
  }
  return PUBLIC_RPC_URL;
};

export interface RpcHealthResult {
  ok: boolean;
  latency?: number;
  version?: string;
  error?: string;
}

export const checkRpcHealth = async (
  url: string,
  timeoutMs = 6000
): Promise<RpcHealthResult> => {
  if (!url || typeof url !== "string") {
    return { ok: false, error: "Empty URL" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = performance.now();

  try {
    const response = await fetch(url.trim(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "health-check",
        method: "getVersion",
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);
    const latency = Math.round(performance.now() - start);

    if (!response.ok) {
      if (response.status === 403) {
        return { ok: false, error: "403 Forbidden (CORS or Origin blocked)" };
      }
      if (response.status === 429) {
        return { ok: false, error: "429 Rate limit exceeded" };
      }
      return { ok: false, error: `HTTP error ${response.status}` };
    }

    const data = await response.json();

    if (data?.error) {
      return { ok: false, error: data.error.message || "RPC node returned an error" };
    }

    if (data?.result?.["solana-core"]) {
      return {
        ok: true,
        latency,
        version: data.result["solana-core"],
      };
    }

    return { ok: false, error: "Invalid Solana RPC response" };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: "Connection timed out (> 6s)" };
    }
    return { ok: false, error: "Network error or CORS blocked" };
  }
};
