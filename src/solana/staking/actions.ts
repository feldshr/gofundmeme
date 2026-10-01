import { AnchorProvider } from "@coral-xyz/anchor";
import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { GFM_PUBLIC_KEY, GFM_Treasury, SOL_PUBLIC_KEY } from "../../constants";
import {
  getCCProgram,
  getProgramStakingNetworkPDA,
  getProgramStakingNetworkTreasuryPDA,
  getProgramStakingNetworkUserAccount,
  getProgramStakingNetworkUserAccountManager,
  getProgramStakingNetworkUserRecord,
} from "../gfm/utils";
import BN from "bn.js";

export const getsSyncStakingNetworkInstruction = async ({
  provider,
  auth,
  stakingNetwork,
  stakingNetworkSyncAccount,
}: {
  provider: AnchorProvider;
  auth: PublicKey;
  stakingNetwork: PublicKey;
  stakingNetworkSyncAccount: PublicKey;
}) => {
  const program = getCCProgram(provider);

  const { gfmMintAddress } =
    await program.account.gfmStakingNetwork.fetch(stakingNetwork);

  const stakingNetworkWsolAccount = getAssociatedTokenAddressSync(
    SOL_PUBLIC_KEY,
    stakingNetwork,
    true
  );
  const stakingTreasuryAccount = getProgramStakingNetworkTreasuryPDA(
    program.programId,
    gfmMintAddress
  );

  return await program.methods
    .syncStakingNetwork()
    .accounts({
      creator: auth,
      stakingNetwork,
      stakingTreasuryAccount,
      stakingNetworkWsolAccount,
      stakingNetworkSyncAccount,

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

export const createStakerAccount = async ({
  provider,
  staker,
}: {
  provider: AnchorProvider;
  staker: PublicKey;
}) => {
  const program = getCCProgram(provider);
  const stakingNetwork = getProgramStakingNetworkPDA(program.programId);
  const { gfmMintAddress } =
    await program.account.gfmStakingNetwork.fetch(stakingNetwork);

  const stakerAccountManager = getProgramStakingNetworkUserAccountManager(
    program.programId,
    gfmMintAddress,
    staker
  );
  const { sgfmMintAddress, stakersCount } =
    await program.account.gfmStakingNetwork.fetch(stakingNetwork);

  const stakerSgfmTokenAccount = getAssociatedTokenAddressSync(
    sgfmMintAddress,
    staker
  );
  const stakerRecord = getProgramStakingNetworkUserRecord(
    program.programId,
    gfmMintAddress,
    stakingNetwork,
    stakersCount.toNumber()
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

export const stake = async ({
  provider,
  staker,
  amount,
}: {
  provider: AnchorProvider;
  staker: PublicKey;
  amount: number;
}) => {
  const program = getCCProgram(provider);
  const stakingNetwork = getProgramStakingNetworkPDA(program.programId);

  const { sgfmMintAddress, gfmMintAddress } =
    await program.account.gfmStakingNetwork.fetch(stakingNetwork);
  const stakerAccountManager = getProgramStakingNetworkUserAccountManager(
    program.programId,
    gfmMintAddress,
    staker
  );

  const { currentRecord } =
    await program.account.gfmStakerAccountManager.fetch(stakerAccountManager);

  const stakerAccount = getProgramStakingNetworkUserAccount(
    program.programId,
    gfmMintAddress,
    staker,
    currentRecord
  );

  const stakerTokenAccount = getAssociatedTokenAddressSync(
    gfmMintAddress,
    staker
  );
  const stakerSgfmTokenAccount = getAssociatedTokenAddressSync(
    sgfmMintAddress,
    staker
  );

  const stakingNetworkTokenAccount = getAssociatedTokenAddressSync(
    gfmMintAddress,
    stakerAccount,
    true
  );
  const networkSgfmTokenAccount = getAssociatedTokenAddressSync(
    sgfmMintAddress,
    stakingNetwork,
    true
  );

  return await program.methods
    .stake(new BN(amount * 10 ** 6))
    .accounts({
      staker,
      stakingNetwork,

      stakerAccountManager,
      stakerAccount,
      stakerTokenAccount,
      stakingNetworkTokenAccount,
      mint: gfmMintAddress,

      sgfmMint: sgfmMintAddress,
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
  gfmMintAddress,
  staker,
}: {
  record: number;
  provider: AnchorProvider;
  gfmMintAddress: PublicKey;
  staker: PublicKey;
}) => {
  const program = getCCProgram(provider);
  const stakeAccount = await program.account.gfmStakerAccount.fetch(
    getProgramStakingNetworkUserAccount(
      program.programId,
      gfmMintAddress,
      staker,
      record
    )
  );

  if (stakeAccount.userStakedTokens.toNumber() === 0) {
    throw new Error("No tokens staked in this account.");
  }
  const stakingNetwork = getProgramStakingNetworkPDA(program.programId);
  const stakingTreasuryAccount = getProgramStakingNetworkTreasuryPDA(
    program.programId,
    gfmMintAddress
  );

  const stakerAccount = getProgramStakingNetworkUserAccount(
    program.programId,
    gfmMintAddress,
    staker,
    record
  );

  const stakerAccountManager = getProgramStakingNetworkUserAccountManager(
    program.programId,
    gfmMintAddress,
    staker
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
  sgfmMintAddress,
  gfmMintAddress,
}: {
  provider: AnchorProvider;
  staker: PublicKey;
  record: number;
  sgfmMintAddress: PublicKey;
  gfmMintAddress: PublicKey;
}) => {
  const program = getCCProgram(provider);
  const stakingNetwork = getProgramStakingNetworkPDA(program.programId);

  const stakingTreasuryAccount = getProgramStakingNetworkTreasuryPDA(
    program.programId,
    gfmMintAddress
  );

  const stakerAccount = getProgramStakingNetworkUserAccount(
    program.programId,
    gfmMintAddress,
    staker,
    record
  );

  const stakerTokenAccount = getAssociatedTokenAddressSync(
    gfmMintAddress,
    staker
  );

  const receiverAccount =
    await provider.connection.getAccountInfo(stakerTokenAccount);
  let instructions: TransactionInstruction[] = [];
  if (!receiverAccount) {
    instructions.push(
      createAssociatedTokenAccountInstruction(
        staker,
        stakerTokenAccount,
        staker,
        GFM_PUBLIC_KEY,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
  }

  const stakerSgfmTokenAccount = getAssociatedTokenAddressSync(
    sgfmMintAddress,
    staker
  );

  const stakingNetworkTokenAccount = getAssociatedTokenAddressSync(
    gfmMintAddress,
    stakerAccount,
    true
  );
  const networkSgfmTokenAccount = getAssociatedTokenAddressSync(
    sgfmMintAddress,
    stakingNetwork,
    true
  );

  const stakerAccountManager = getProgramStakingNetworkUserAccountManager(
    program.programId,
    gfmMintAddress,
    staker
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
      .instruction()
  );
  return instructions;
};
