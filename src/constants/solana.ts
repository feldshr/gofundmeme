import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PublicKey } from "@solana/web3.js";

export const NETWORK = WalletAdapterNetwork.Mainnet;
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
} as const;
