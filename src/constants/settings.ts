export type RpcType = "public" | "custom";

export const PUBLIC_RPC_URL = "https://solana.publicnode.com";
export const RPC_ENDPOINT_URL = PUBLIC_RPC_URL;

export const RPC_SELECT_DATA = [
  {
    value: "public",
    label: "Public (Allnodes)",
  },
  {
    value: "custom",
    label: "Custom",
  },
] as const;

export const SOL_EXPLORERS = {
  solscan: {
    label: "Solscan",
    href: "https://solscan.io/",
  },
  solana_explorer: {
    label: "Solana Explorer",
    href: "https://explorer.solana.com/",
  },
  solana_fm: {
    label: "SolanaFM",
    href: "https://solana.fm/",
  },
} as const;

export type ExplorerKey = keyof typeof SOL_EXPLORERS;

export const EXPLORER_SELECT_DATA = (
  Object.entries(SOL_EXPLORERS) as [
    ExplorerKey,
    (typeof SOL_EXPLORERS)[ExplorerKey],
  ][]
).map(([key, item]) => ({
  value: key,
  label: item.label,
}));

export const DEFAULT_PRIORITY_FEE = 0.0001;
export const MIN_PRIORITY_FEE = 0.00001;
export const PRIORITY_FEE_STEP = 0.00001;
