import { type AnchorProvider } from "@coral-xyz/anchor";
import {
  AccountLayout,
  getAssociatedTokenAddressSync,
  getMint,
} from "@solana/spl-token";
import BN from "bn.js";
import {
  type Connection,
  LAMPORTS_PER_SOL,
  type PublicKey,
} from "@solana/web3.js";
import { GFM_PUBLIC_KEY, SOL_PUBLIC_KEY, GFM_DECIMALS } from "../constants";
import { REWARDS_SCALE_FACTOR } from "./constants";
import { getGfmProgram } from "../program";
import { adjustDecimals } from "../utils";
import {
  getProgramStakingNetworkPDA,
  getProgramStakingNetworkTreasuryPDA,
  getProgramStakingNetworkTreasurySyncPDA,
  getProgramStakingNetworkUserAccount,
  getProgramStakingNetworkUserAccountManager,
} from "./pda";

export const getStaking = async ({
  provider,
  gfmMintAddress = GFM_PUBLIC_KEY,
}: {
  provider: AnchorProvider;
  gfmMintAddress?: PublicKey;
}) => {
  const program = getGfmProgram(provider);
  const stakingNetwork = getProgramStakingNetworkPDA(program.programId);

  const stakingNetworkTreasuryAccount = getProgramStakingNetworkTreasuryPDA(
    gfmMintAddress,
    program.programId,
  );
  const stakingNetworkSyncAccount = getProgramStakingNetworkTreasurySyncPDA(
    gfmMintAddress,
    program.programId,
  );

  // Parallelize network fetch, mint fetching, and reward balances in ONE single roundtrip
  const [stakingNetworkData, gfmMint, balance] = await Promise.all([
    program.account.gfmStakingNetwork.fetch(stakingNetwork),
    getMint(provider.connection, gfmMintAddress),
    getStakingNetworkRewardBalances({
      connection: provider.connection,
      stakingNetwork,
      stakingNetworkTreasuryAccount,
      stakingNetworkSyncAccount,
    }),
  ]);

  return {
    totalStakedTokens: adjustDecimals(
      stakingNetworkData.totalStakedTokens,
      gfmMint.decimals,
    ),
    sgfmMintAddress: stakingNetworkData.sgfmMintAddress,
    gfmToken: {
      supply: adjustDecimals(
        new BN(gfmMint.supply.toString()),
        gfmMint.decimals,
      ),
      decimals: gfmMint.decimals,
      address: gfmMint.address,
    },
    claimedRewards: adjustDecimals(stakingNetworkData.claimedRewards, 9),
    totalRewards: adjustDecimals(stakingNetworkData.totalRewards, 9),
    stakersCount: stakingNetworkData.stakersCount.toNumber(),
    stakingNetwork,
    stakingNetworkTreasuryAccount,
    stakingNetworkSyncAccount,
    lastNetworkSync: new Date(
      stakingNetworkData?.lastNetworkSyncTimestamp.toNumber() * 1000,
    ),
    cumulativeRewardsPerToken:
      stakingNetworkData.cumulativeRewardsPerToken.toNumber(),
    balance,
  };
};

export const getStakingNetworkRewardBalances = async ({
  connection,
  stakingNetwork,
  stakingNetworkTreasuryAccount,
  stakingNetworkSyncAccount,
}: {
  connection: Connection;
  stakingNetwork: PublicKey;
  stakingNetworkTreasuryAccount: PublicKey;
  stakingNetworkSyncAccount: PublicKey;
}) => {
  const wsolAta = getAssociatedTokenAddressSync(
    SOL_PUBLIC_KEY,
    stakingNetwork,
    true,
  );

  // Fetch all 3 reward accounts in a single batch RPC request
  const accounts = await connection.getMultipleAccountsInfo([
    stakingNetworkTreasuryAccount,
    stakingNetworkSyncAccount,
    wsolAta,
  ]);

  const currentSOLBalance = accounts[0]?.lamports ?? 0;
  const pendingSyncSolBalance = accounts[1]?.lamports ?? 0;

  let pendingSyncWSolRewards = 0;
  if (accounts[2]?.data) {
    try {
      const decoded = AccountLayout.decode(accounts[2].data);
      pendingSyncWSolRewards = adjustDecimals(decoded.amount, 9);
    } catch {
      pendingSyncWSolRewards = 0;
    }
  }

  return {
    availableRewards: currentSOLBalance / LAMPORTS_PER_SOL,
    pendingRewards:
      pendingSyncSolBalance / LAMPORTS_PER_SOL + pendingSyncWSolRewards,
  };
};

export const hasStakingAccount = async ({
  provider,
  staker,
  gfmMintAddress = GFM_PUBLIC_KEY,
}: {
  provider: AnchorProvider;
  staker: PublicKey;
  gfmMintAddress?: PublicKey;
}): Promise<boolean> => {
  try {
    const program = getGfmProgram(provider);
    const stakerAccountManager = getProgramStakingNetworkUserAccountManager(
      gfmMintAddress,
      staker,
      program.programId,
    );
    await program.account.gfmStakerAccountManager.fetch(stakerAccountManager);
    return true;
  } catch {
    return false;
  }
};

export const getStakerStakeAccounts = async ({
  provider,
  staker,
  gfmMintAddress = GFM_PUBLIC_KEY,
  decimals = GFM_DECIMALS,
}: {
  provider: AnchorProvider;
  staker: PublicKey;
  gfmMintAddress?: PublicKey;
  decimals?: number;
}) => {
  const program = getGfmProgram(provider);
  const stakerAccountManager = getProgramStakingNetworkUserAccountManager(
    gfmMintAddress,
    staker,
    program.programId,
  );

  try {
    const { currentRecord, claimedRewards } =
      await program.account.gfmStakerAccountManager.fetch(stakerAccountManager);

    const userStakeAccounts: PublicKey[] = [];
    for (let index = 0; index < currentRecord; index++) {
      userStakeAccounts.push(
        getProgramStakingNetworkUserAccount(
          gfmMintAddress,
          staker,
          index,
          program.programId,
        ),
      );
    }

    // Chunk into batches of 100 to stay within Solana RPC getMultipleAccounts limit
    const CHUNK_SIZE = 100;
    const chunks: PublicKey[][] = [];
    for (let i = 0; i < userStakeAccounts.length; i += CHUNK_SIZE) {
      chunks.push(userStakeAccounts.slice(i, i + CHUNK_SIZE));
    }

    const fetchedBatches = await Promise.all(
      chunks.map((chunk) =>
        program.account.gfmStakerAccount.fetchMultiple(chunk),
      ),
    );
    const resp = fetchedBatches.flat();

    const records: {
      record: number;
      claimedRewards: number;
      stakingTimestamp: Date;
      lastClaimedTimestamp: Date;
      userStakedTokens: number;
      userCumulativeRewardsPerToken: number;
      userAccumulatedRewards: number;
    }[] = [];

    resp?.forEach((item) => {
      if (!item) return;

      const {
        record,
        claimedRewards: itemClaimedRewards,
        stakingTimestamp,
        lastClaimedTimestamp,
        userStakedTokens,
        userCumulativeRewardsPerToken,
        userAccumulatedRewards,
      } = item;

      records.push({
        record,
        claimedRewards: adjustDecimals(
          itemClaimedRewards.div(REWARDS_SCALE_FACTOR),
          decimals,
        ),
        stakingTimestamp: new Date(stakingTimestamp.toNumber() * 1000),
        lastClaimedTimestamp: new Date(lastClaimedTimestamp.toNumber() * 1000),
        userStakedTokens: adjustDecimals(
          new BN(userStakedTokens.toString()),
          decimals,
        ),
        userCumulativeRewardsPerToken: userCumulativeRewardsPerToken.toNumber(),
        userAccumulatedRewards: userAccumulatedRewards.toNumber(),
      });
    });

    return {
      claimedRewards: adjustDecimals(
        claimedRewards.div(REWARDS_SCALE_FACTOR),
        decimals,
      ),
      records,
    };
  } catch (error) {
    console.error("Failed to fetch staker stake accounts:", error);
    return null;
  }
};
