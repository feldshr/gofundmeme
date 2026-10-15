import { Connection } from "@solana/web3.js";
import { COMMITMENT, PUBLIC_RPC_URL } from "./constants";

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

    if (
      parsedType === "custom" &&
      parsedCustom &&
      checkIsValidUrl(parsedCustom)
    ) {
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
  timeoutMs = 6000,
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
      return {
        ok: false,
        error: data.error.message || "RPC node returned an error",
      };
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

const connectionCache = new Map<string, Connection>();

/**
 * Returns a cached Connection instance for the specified RPC URL or active RPC.
 * Reuses the single instance across the entire application for each endpoint.
 */
export const getConnection = (rpcUrl?: string): Connection => {
  const targetUrl = rpcUrl || getActiveRpc();
  let connection = connectionCache.get(targetUrl);
  if (!connection) {
    connection = new Connection(targetUrl, COMMITMENT);
    connectionCache.set(targetUrl, connection);
  }
  return connection;
};

