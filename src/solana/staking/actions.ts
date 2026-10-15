import { type AnchorProvider } from "@coral-xyz/anchor";
import {
  type PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  type TransactionInstruction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import BN from "bn.js";
import Decimal from "decimal.js";
import {
  GFM_DECIMALS,
  GFM_PUBLIC_KEY,
  GFM_Treasury,
  sGFM_PUBLIC_KEY,
  SOL_PUBLIC_KEY,
} from "../constants";
import { getGfmProgram } from "../program";
import {
  getProgramStakingNetworkPDA,
  getProgramStakingNetworkTreasuryPDA,
  getProgramStakingNetworkTreasurySyncPDA,
  getProgramStakingNetworkUserAccount,
  getProgramStakingNetworkUserAccountManager,
  getProgramStakingNetworkUserRecord,
} from "./pda";

export const getSyncStakingNetworkInstruction = async ({
  provider,
  auth,
  stakingNetwork,
  stakingNetworkSyncAccount,
  gfmMintAddress = GFM_PUBLIC_KEY,
}: {
  provider: AnchorProvider;
  auth: PublicKey;
  stakingNetwork?: PublicKey;
  stakingNetworkSyncAccount?: PublicKey;
  gfmMintAddress?: PublicKey;
}): Promise<TransactionInstruction> => {
  const program = getGfmProgram(provider);
  const resolvedStakingNetwork =
    stakingNetwork ?? getProgramStakingNetworkPDA(program.programId);
  const resolvedSyncAccount =
    stakingNetworkSyncAccount ??
    getProgramStakingNetworkTreasurySyncPDA(
      gfmMintAddress,
      program.programId,
    );

  const stakingNetworkWsolAccount = getAssociatedTokenAddressSync(
    SOL_PUBLIC_KEY,
    resolvedStakingNetwork,
    true,
  );
  const stakingTreasuryAccount = getProgramStakingNetworkTreasuryPDA(
    gfmMintAddress,
    program.programId,
  );

  return await program.methods
    .syncStakingNetwork()
    .accounts({
      creator: auth,
      stakingNetwork: resolvedStakingNetwork,
      stakingTreasuryAccount,
      stakingNetworkWsolAccount,
      stakingNetworkSyncAccount: resolvedSyncAccount,

      solAddress: SOL_PUBLIC_KEY,
      gfmFoundationAccount: GFM_Treasury,
      mint: gfmMintAddress,

      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      clock: SYSVAR_CLOCK_PUBKEY,

      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .instruction();
};

export const getCreateStakerAccountInstruction = async ({
  provider,
  staker,
  gfmMintAddress = GFM_PUBLIC_KEY,
  sgfmMintAddress = sGFM_PUBLIC_KEY,
}: {
  provider: AnchorProvider;
  staker: PublicKey;
  gfmMintAddress?: PublicKey;
  sgfmMintAddress?: PublicKey;
}): Promise<TransactionInstruction> => {
  const program = getGfmProgram(provider);
  const stakingNetwork = getProgramStakingNetworkPDA(program.programId);

  const { stakersCount } =
    await program.account.gfmStakingNetwork.fetch(stakingNetwork);

  const stakerAccountManager = getProgramStakingNetworkUserAccountManager(
    gfmMintAddress,
    staker,
    program.programId,
  );

  const stakerSgfmTokenAccount = getAssociatedTokenAddressSync(
    sgfmMintAddress,
    staker,
  );
  const stakerRecord = getProgramStakingNetworkUserRecord(
    gfmMintAddress,
    stakingNetwork,
    stakersCount.toNumber(),
    program.programId,
  );

  return await program.methods
    .createStakerAccount()
    .accounts({
      staker,
      stakingNetwork,

      stakerAccountManager,
      sgfmMint: sgfmMintAddress,
      stakerSgfmTokenAccount,
      stakerRecord,

      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
};

export const getStakeInstruction = async ({
  provider,
  staker,
  amount,
  decimals = GFM_DECIMALS,
  gfmMintAddress = GFM_PUBLIC_KEY,
  sgfmMintAddress = sGFM_PUBLIC_KEY,
  currentRecord,
}: {
  provider: AnchorProvider;
  staker: PublicKey;
  amount: number;
  decimals?: number;
  gfmMintAddress?: PublicKey;
  sgfmMintAddress?: PublicKey;
  currentRecord?: number;
}): Promise<TransactionInstruction> => {
  const program = getGfmProgram(provider);
  const stakingNetwork = getProgramStakingNetworkPDA(program.programId);

  let resolvedGfmMint = gfmMintAddress;
  let resolvedSgfmMint = sgfmMintAddress;
  if (!resolvedGfmMint || !resolvedSgfmMint) {
    const networkData =
      await program.account.gfmStakingNetwork.fetch(stakingNetwork);
    resolvedGfmMint = resolvedGfmMint ?? networkData.gfmMintAddress;
    resolvedSgfmMint = resolvedSgfmMint ?? networkData.sgfmMintAddress;
  }

  const stakerAccountManager = getProgramStakingNetworkUserAccountManager(
    resolvedGfmMint,
    staker,
    program.programId,
  );

  let resolvedRecord = currentRecord;
  if (resolvedRecord === undefined) {
    const managerData =
      await program.account.gfmStakerAccountManager.fetch(stakerAccountManager);
    resolvedRecord = managerData.currentRecord;
  }

  const stakerAccount = getProgramStakingNetworkUserAccount(
    resolvedGfmMint,
    staker,
    resolvedRecord,
    program.programId,
  );

  const stakerTokenAccount = getAssociatedTokenAddressSync(
    resolvedGfmMint,
    staker,
  );
  const stakerSgfmTokenAccount = getAssociatedTokenAddressSync(
    resolvedSgfmMint,
    staker,
  );

  const stakingNetworkTokenAccount = getAssociatedTokenAddressSync(
    resolvedGfmMint,
    stakerAccount,
    true,
  );
  const networkSgfmTokenAccount = getAssociatedTokenAddressSync(
    resolvedSgfmMint,
    stakingNetwork,
    true,
  );

  // Exact decimal multiplication without floating point rounding errors
  const amountInSmallestUnits = new BN(
    new Decimal(amount).mul(new Decimal(10).pow(decimals)).toFixed(0),
  );

  return await program.methods
    .stake(amountInSmallestUnits)
    .accounts({
      staker,
      stakingNetwork,

      stakerAccountManager,
      stakerAccount,
      stakerTokenAccount,
      stakingNetworkTokenAccount,
      mint: resolvedGfmMint,

      sgfmMint: resolvedSgfmMint,
      stakerSgfmTokenAccount,
      networkSgfmTokenAccount,

      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      clock: SYSVAR_CLOCK_PUBKEY,
    })
    .instruction();
};

export const getClaimInstruction = async ({
  record,
  provider,
  staker,
  gfmMintAddress = GFM_PUBLIC_KEY,
}: {
  record: number;
  provider: AnchorProvider;
  staker: PublicKey;
  gfmMintAddress?: PublicKey;
}): Promise<TransactionInstruction> => {
  const program = getGfmProgram(provider);

  const stakerAccount = getProgramStakingNetworkUserAccount(
    gfmMintAddress,
    staker,
    record,
    program.programId,
  );

  const stakeAccount =
    await program.account.gfmStakerAccount.fetch(stakerAccount);

  if (stakeAccount.userStakedTokens.isZero()) {
    throw new Error("No tokens staked in this account.");
  }

  const stakingNetwork = getProgramStakingNetworkPDA(program.programId);
  const stakingTreasuryAccount = getProgramStakingNetworkTreasuryPDA(
    gfmMintAddress,
    program.programId,
  );

  const stakerAccountManager = getProgramStakingNetworkUserAccountManager(
    gfmMintAddress,
    staker,
    program.programId,
  );

  return await program.methods
    .stakerClaim()
    .accounts({
      staker,
      stakingNetwork,
      stakerAccount,
      stakerAccountManager,
      stakingTreasuryAccount,
      clock: SYSVAR_CLOCK_PUBKEY,
    })
    .instruction();
};

export const getUnstakeInstruction = async ({
  provider,
  staker,
  record,
  sgfmMintAddress = sGFM_PUBLIC_KEY,
  gfmMintAddress = GFM_PUBLIC_KEY,
}: {
  provider: AnchorProvider;
  staker: PublicKey;
  record: number;
  sgfmMintAddress?: PublicKey;
  gfmMintAddress?: PublicKey;
}): Promise<TransactionInstruction[]> => {
  const program = getGfmProgram(provider);
  const stakingNetwork = getProgramStakingNetworkPDA(program.programId);

  const stakingTreasuryAccount = getProgramStakingNetworkTreasuryPDA(
    gfmMintAddress,
    program.programId,
  );

  const stakerAccount = getProgramStakingNetworkUserAccount(
    gfmMintAddress,
    staker,
    record,
    program.programId,
  );

  const stakerTokenAccount = getAssociatedTokenAddressSync(
    gfmMintAddress,
    staker,
  );

  const receiverAccount =
    await provider.connection.getAccountInfo(stakerTokenAccount);
  const instructions: TransactionInstruction[] = [];
  if (!receiverAccount) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        staker,
        stakerTokenAccount,
        staker,
        gfmMintAddress,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID,
      ),
    );
  }

  const stakerSgfmTokenAccount = getAssociatedTokenAddressSync(
    sgfmMintAddress,
    staker,
  );

  const stakingNetworkTokenAccount = getAssociatedTokenAddressSync(
    gfmMintAddress,
    stakerAccount,
    true,
  );
  const networkSgfmTokenAccount = getAssociatedTokenAddressSync(
    sgfmMintAddress,
    stakingNetwork,
    true,
  );

  const stakerAccountManager = getProgramStakingNetworkUserAccountManager(
    gfmMintAddress,
    staker,
    program.programId,
  );

  instructions.push(
    await program.methods
      .unstake()
      .accounts({
        staker,
        stakingNetwork,
        stakerAccount,
        stakerAccountManager,
        stakingTreasuryAccount,

        stakerSgfmTokenAccount,
        networkSgfmTokenAccount,

        stakerTokenAccount,
        stakingNetworkTokenAccount,

        mint: gfmMintAddress,
        sgfmMint: sgfmMintAddress,

        tokenProgram: TOKEN_PROGRAM_ID,
        clock: SYSVAR_CLOCK_PUBKEY,
      })
      .instruction(),
  );
  return instructions;
};
