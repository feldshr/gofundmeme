import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PublicKey } from "@solana/web3.js";

export const NETWORK = WalletAdapterNetwork.Mainnet;
export const RPC_ENDPOINT_URL = "https://solana.publicnode.com"; //
export const COMMITMENT = "confirmed";

export const GFM_Program = new PublicKey(
  "GFMioXjhuDWMEBtuaoaDPJFPEnL2yDHCWKoVPhj1MeA7",
);

export const GFM_Treasury = new PublicKey(
  "CNJRjP4dwLwAGUgZ9CoGUDiA82jU1rWK9zGvse2T2saL",
);

export const GFM_PUBLIC_KEY = new PublicKey(
  "E1jCTXdkMRoawoWoqfbhiNkkLbxcSHPssMo36U84pump",
);

export const SOL_PUBLIC_KEY = new PublicKey(
  "So11111111111111111111111111111111111111112",
);

export const VAULTS = {
  "24Uqj9JCLxUeoC3hGfh5W3s9FM9uCHDS2SG3LYwBpyTi": "Meteora Pool",
  GpMZbSM2GgvTKHJirzeGfMFoaZ8UR2X7F4v8vHTvxFbL: "Raydium Pool",
  FhVo3mqL8PW5pH5U2CN4XE33DokiyZnUwuGpH2hmHLuM: "Bonding Curve",
};

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

export const DATE_FORMAT = "D MMM YYYY in HH:mm";

export const STAKING_DURATION = {
  lock: 604_800_000, // 7 days
  unlock: 604_800_000, // 7 days
  full: 1_209_600_000, // 14 days
};
