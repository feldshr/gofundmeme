import {
  getCCProgram,
  getProgramStakingNetworkPDA,
  getProgramStakingNetworkTreasuryPDA,
  getProgramStakingNetworkTreasurySyncPDA,
  getProgramStakingNetworkUserAccount,
  getProgramStakingNetworkUserAccountManager,
} from "../gfm/utils";
import { AnchorProvider } from "@coral-xyz/anchor";
import {
  getAccount,
  getAssociatedTokenAddressSync,
  getMint,
} from "@solana/spl-token";
import { adjustDecimals } from "../utils";
import BN from "bn.js";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { SOL_PUBLIC_KEY } from "../../constants";

export const getStaking = async ({
  provider,
}: {
  provider: AnchorProvider;
}) => {
  const program = getCCProgram(provider);
  const stakingNetwork = getProgramStakingNetworkPDA(program.programId);
  const stakingNetworkData =
    await program.account.gfmStakingNetwork.fetch(stakingNetwork);
  const stakingNetworkTreasuryAccount = getProgramStakingNetworkTreasuryPDA(
    program.programId,
    stakingNetworkData.gfmMintAddress
  );
  const stakingNetworkSyncAccount = getProgramStakingNetworkTreasurySyncPDA(
    program.programId,
    stakingNetworkData.gfmMintAddress
  );
  const gfmMint = await getMint(
    provider.connection,
    stakingNetworkData.gfmMintAddress
  );
  const balance = await getStakingNetworkRewardBalances({
    connection: provider.connection,
    stakingNetwork,
    stakingNetworkTreasuryAccount,
    stakingNetworkSyncAccount,
  });

  return {
    totalStakedTokens: adjustDecimals(
      stakingNetworkData.totalStakedTokens,
      gfmMint.decimals
    ),
    sgfmMintAddress: stakingNetworkData.sgfmMintAddress,
    gfmToken: {
      supply: adjustDecimals(
        new BN(gfmMint.supply.toString()),
        gfmMint.decimals
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
      stakingNetworkData?.lastNetworkSyncTimestamp.toNumber() * 1000
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
  // Currently in network
  const currentSOLRewards =
    (await connection.getBalance(stakingNetworkTreasuryAccount)) /
    LAMPORTS_PER_SOL;

  // Pending sync
  const pendingSyncSolRewards =
    (await connection.getBalance(stakingNetworkSyncAccount)) / LAMPORTS_PER_SOL;
  const pendingSyncWSolRewards = await getAccountBalance({
    connection,
    mintAddress: SOL_PUBLIC_KEY,
    walletAddress: stakingNetwork,
  });

  return {
    availableRewards: currentSOLRewards,
    pendingRewards: pendingSyncSolRewards + pendingSyncWSolRewards,
  };
};

export const getAccountBalance = async ({
  connection,
  mintAddress,
  walletAddress,
}: {
  connection: Connection;
  mintAddress: PublicKey;
  walletAddress: PublicKey;
}) => {
  const mint = await getMint(connection, mintAddress);
  const ata = getAssociatedTokenAddressSync(mintAddress, walletAddress, true);
  const t = await getAccount(connection, ata);
  return adjustDecimals(new BN(t.amount.toString()), mint.decimals);
};

export const hasStakingAccount = async ({
  provider,
  gfmMintAddress,
  staker,
}: {
  provider: AnchorProvider;
  gfmMintAddress: PublicKey;
  staker: PublicKey;
}) => {
  try {
    const program = getCCProgram(provider);
    const stakerAccountManager = getProgramStakingNetworkUserAccountManager(
      program.programId,
      gfmMintAddress,
      staker
    );
    await program.account.gfmStakerAccountManager.fetch(stakerAccountManager);
    return true;
  } catch {
    /* empty */
  }
  return false;
};
export const getStakerStakeAccounts = async ({
  provider,
  gfmMintAddress,
  staker,
  decimals,
}: {
  provider: AnchorProvider;
  gfmMintAddress: PublicKey;
  staker: PublicKey;
  decimals: number;
}) => {
  const program = getCCProgram(provider);
  const stakerAccountManager = getProgramStakingNetworkUserAccountManager(
    program.programId,
    gfmMintAddress,
    staker
  );

  try {
    const { currentRecord, claimedRewards } =
      await program.account.gfmStakerAccountManager.fetch(stakerAccountManager);

    const userStakeAccounts: PublicKey[] = [];
    for (let index = 0; index < currentRecord; index++) {
      userStakeAccounts.push(
        getProgramStakingNetworkUserAccount(
          program.programId,
          gfmMintAddress,
          staker,
          index
        )
      );
    }

    const resp =
      await program.account.gfmStakerAccount.fetchMultiple(userStakeAccounts);

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
      if (!item) {
        return;
      }

      const {
        record,
        claimedRewards,
        stakingTimestamp,
        lastClaimedTimestamp,
        userStakedTokens,
        userCumulativeRewardsPerToken,
        userAccumulatedRewards,
      } = item!;

      records.push({
        record,
        claimedRewards: adjustDecimals(
          claimedRewards.div(new BN(1000)),
          decimals
        ),
        stakingTimestamp: new Date(stakingTimestamp.toNumber() * 1000),
        lastClaimedTimestamp: new Date(lastClaimedTimestamp.toNumber() * 1000),
        userStakedTokens: adjustDecimals(
          new BN(userStakedTokens.toString()),
          decimals
        ),
        userCumulativeRewardsPerToken: userCumulativeRewardsPerToken.toNumber(),
        userAccumulatedRewards: userAccumulatedRewards.toNumber(),
      });
    });

    return {
      claimedRewards: adjustDecimals(claimedRewards, decimals),
      records,
    };
  } catch (error) {
    return null;
  }
};
