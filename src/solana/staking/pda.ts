import { PublicKey } from "@solana/web3.js";
import { GFM_Program, GFM_PUBLIC_KEY } from "../constants";

export const STAKING_SEEDS = {
  NETWORK: "g_network_sts",
  TREASURY: "sn_treasury",
  TREASURY_SYNC: "sn_treasury_sync",
  USER_RECORD: "u_sn_tbl_",
  ACCOUNT_MANAGER: "a_sn_a_mgr_",
  USER_ACCOUNT: "a_sn_a_",
} as const;

/**
 * Derives the global Staking Network PDA.
 * Seeds: ["g_network_sts"]
 */
export function getProgramStakingNetworkPDA(
  programId: PublicKey = GFM_Program,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(STAKING_SEEDS.NETWORK)],
    programId,
  )[0];
}

/**
 * Derives the Staking Network Treasury PDA.
 * Seeds: ["sn_treasury", gfmMint]
 */
export function getProgramStakingNetworkTreasuryPDA(
  gfmMint: PublicKey = GFM_PUBLIC_KEY,
  programId: PublicKey = GFM_Program,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(STAKING_SEEDS.TREASURY), gfmMint.toBuffer()],
    programId,
  )[0];
}

/**
 * Derives the Staking Network Treasury Sync PDA.
 * Seeds: ["sn_treasury_sync", gfmMint]
 */
export function getProgramStakingNetworkTreasurySyncPDA(
  gfmMint: PublicKey = GFM_PUBLIC_KEY,
  programId: PublicKey = GFM_Program,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(STAKING_SEEDS.TREASURY_SYNC), gfmMint.toBuffer()],
    programId,
  )[0];
}

/**
 * Derives the Staking Network User Record PDA.
 * Seeds: ["u_sn_tbl_", gfmMint, stakingNetwork, index (u32 BE)]
 */
export function getProgramStakingNetworkUserRecord(
  gfmMint: PublicKey,
  stakingNetwork: PublicKey,
  index: number,
  programId: PublicKey = GFM_Program,
): PublicKey {
  const indexBuffer = Buffer.alloc(4);
  indexBuffer.writeUInt32BE(index, 0);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(STAKING_SEEDS.USER_RECORD),
      gfmMint.toBuffer(),
      stakingNetwork.toBuffer(),
      indexBuffer,
    ],
    programId,
  )[0];
}

/**
 * Derives the Staker Account Manager PDA.
 * Seeds: ["a_sn_a_mgr_", gfmMint, staker]
 */
export function getProgramStakingNetworkUserAccountManager(
  gfmMint: PublicKey,
  staker: PublicKey,
  programId: PublicKey = GFM_Program,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(STAKING_SEEDS.ACCOUNT_MANAGER),
      gfmMint.toBuffer(),
      staker.toBuffer(),
    ],
    programId,
  )[0];
}

/**
 * Derives the individual Staker Account PDA by index.
 * Seeds: ["a_sn_a_", gfmMint, staker, index (u32 BE)]
 */
export function getProgramStakingNetworkUserAccount(
  gfmMint: PublicKey,
  staker: PublicKey,
  index: number,
  programId: PublicKey = GFM_Program,
): PublicKey {
  const indexBuffer = Buffer.alloc(4);
  indexBuffer.writeUInt32BE(index, 0);
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(STAKING_SEEDS.USER_ACCOUNT),
      gfmMint.toBuffer(),
      staker.toBuffer(),
      indexBuffer,
    ],
    programId,
  )[0];
}

