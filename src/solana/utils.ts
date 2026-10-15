import {
  type Commitment,
  ComputeBudgetProgram,
  type Connection,
  type PublicKey,
  Transaction,
  type TransactionInstruction,
} from "@solana/web3.js";
import {
  getAccount,
  getAssociatedTokenAddressSync,
  getMint,
  TokenAccountNotFoundError,
} from "@solana/spl-token";
import BN from "bn.js";
import Decimal from "decimal.js";
import { COMMITMENT, SOL_PUBLIC_KEY } from "./constants";
import { getConnection } from "./connection";

export { getConnection };

export interface BalanceParams {
  walletAddress: PublicKey | null;
  mintAddress?: PublicKey;
  decimals?: number;
  connection?: Connection;
}

/**
 * Unified balance fetching function for Solana.
 * - Call `getBalance(walletAddress, connection?)` to fetch native SOL balance.
 * - Call `getBalance({ walletAddress, mintAddress, decimals, connection })` to fetch SPL token or SOL balance.
 * - If `decimals` is passed, skips unnecessary `getMint` network call.
 * - Safely returns 0 if walletAddress is null or token account does not exist.
 */
export async function getBalance(
  walletAddress: PublicKey | null,
  connection?: Connection,
): Promise<number>;
export async function getBalance(params: BalanceParams): Promise<number>;
export async function getBalance(
  walletOrParams: PublicKey | null | BalanceParams,
  connectionArg?: Connection,
): Promise<number> {
  let walletAddress: PublicKey | null;
  let mintAddress: PublicKey | undefined;
  let decimals: number | undefined;
  let connection: Connection | undefined;

  if (
    walletOrParams !== null &&
    typeof walletOrParams === "object" &&
    "walletAddress" in walletOrParams
  ) {
    walletAddress = walletOrParams.walletAddress;
    mintAddress = walletOrParams.mintAddress;
    decimals = walletOrParams.decimals;
    connection = walletOrParams.connection;
  } else {
    walletAddress = walletOrParams;
    connection = connectionArg;
  }

  if (!walletAddress) return 0;
  const conn = connection || getConnection();

  // Native SOL balance
  if (!mintAddress) {
    const lamports = await conn.getBalance(walletAddress, COMMITMENT);
    return adjustDecimals(new BN(lamports.toString()), 9);
  }

  // SPL Token / Wrapped SOL balance
  try {
    const ata = getAssociatedTokenAddressSync(mintAddress, walletAddress, true);
    const isWsol = mintAddress.equals(SOL_PUBLIC_KEY);

    const [resolvedDecimals, account] = await Promise.all([
      decimals ??
        (isWsol ? 9 : (await getMint(conn, mintAddress, COMMITMENT)).decimals),
      getAccount(conn, ata, COMMITMENT),
    ]);

    return adjustDecimals(new BN(account.amount.toString()), resolvedDecimals);
  } catch (error: unknown) {
    if (
      error instanceof TokenAccountNotFoundError ||
      (error as Error)?.name === "TokenAccountNotFoundError" ||
      (error as Error)?.message?.includes("could not find account")
    ) {
      return 0;
    }
    console.error("Failed to fetch token balance:", error);
    throw error;
  }
}
const CONFIRMATION_LEVELS: Record<string, number> = {
  processed: 1,
  confirmed: 2,
  finalized: 3,
};

export const waitForTransaction = (
  signature: string,
  confirmationStatus: "processed" | "confirmed" | "finalized" = "confirmed",
  timeout = 120_000,
  connection?: Connection,
  signal?: AbortSignal,
): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new Error("Transaction confirmation aborted"));
    }

    const conn = connection || getConnection();
    const startTime = Date.now();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const onAbort = () => {
      if (timeoutId) clearTimeout(timeoutId);
      reject(new Error("Transaction confirmation aborted"));
    };

    signal?.addEventListener("abort", onAbort, { once: true });

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      signal?.removeEventListener("abort", onAbort);
    };

    const checkTransactionStatus = async () => {
      if (signal?.aborted) {
        cleanup();
        return;
      }

      try {
        const statuses = await conn.getSignatureStatuses([signature], {
          searchTransactionHistory: true,
        });
        const status = statuses?.value[0];

        if (status) {
          if (status.err) {
            cleanup();
            return reject(
              new Error(`Transaction failed: ${JSON.stringify(status.err)}`),
            );
          }

          const currentLevel = status.confirmationStatus
            ? CONFIRMATION_LEVELS[status.confirmationStatus] ?? 0
            : 0;
          const targetLevel = CONFIRMATION_LEVELS[confirmationStatus] ?? 2;

          if (currentLevel >= targetLevel) {
            cleanup();
            return resolve(true);
          }
        }

        if (Date.now() - startTime > timeout) {
          cleanup();
          return reject(new Error("Transaction confirmation timed out"));
        }

        timeoutId = setTimeout(checkTransactionStatus, 3_000);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    checkTransactionStatus();
  });
};

export const createPriorityFeeInstruction = (
  priorityFee: number = 0,
  computeUnits: number = 300_000,
): TransactionInstruction[] => {
  const instructions: TransactionInstruction[] = [
    ComputeBudgetProgram.setComputeUnitLimit({ units: computeUnits }),
  ];

  if (priorityFee > 0) {
    // Use Decimal to prevent floating point inaccuracies
    const priorityFeeInLamports = new Decimal(priorityFee)
      .mul(1_000_000_000)
      .toNumber();

    const microLamports = Math.floor(
      (priorityFeeInLamports * 1_000_000) / computeUnits,
    );

    instructions.unshift(
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports }),
    );
  }

  return instructions;
};

export const adjustDecimals = (
  amount: number | BN | Decimal | bigint,
  decimals: number = 9,
): number => {
  return new Decimal(amount.toString())
    .div(new Decimal(10).pow(decimals))
    .toNumber();
};

export interface SendTransactionOptions {
  connection: Connection;
  payer: PublicKey;
  instructions: TransactionInstruction | TransactionInstruction[];
  signTransaction: (tx: Transaction) => Promise<Transaction>;
  priorityFee?: number;
  computeUnits?: number;
  commitment?: Commitment;
}

/**
 * Creates, populates priority fees, signs, and sends a Solana transaction.
 */
export async function sendTransaction({
  connection,
  payer,
  instructions,
  signTransaction,
  priorityFee = 0,
  computeUnits = 300_000,
  commitment = COMMITMENT,
}: SendTransactionOptions): Promise<string> {
  const priorityInstructions = createPriorityFeeInstruction(
    priorityFee,
    computeUnits,
  );
  const txInstructions = Array.isArray(instructions)
    ? instructions
    : [instructions];

  const transaction = new Transaction()
    .add(...priorityInstructions)
    .add(...txInstructions);

  transaction.feePayer = payer;
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash(commitment)
  ).blockhash;

  const signedTransaction = await signTransaction(transaction);
  return await connection.sendRawTransaction(signedTransaction.serialize(), {
    preflightCommitment: commitment,
  });
}


