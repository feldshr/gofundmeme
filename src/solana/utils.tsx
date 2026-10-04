import {
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
import { COMMITMENT, SOL_EXPLORERS } from "../constants";
import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import BN from "bn.js";
import Decimal from "decimal.js";
import { getActiveRpc, getExplorerLink, walletAddressToShorten } from "../utils";
import { notifications } from "@mantine/notifications";
import { Anchor } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";

export const getSolBalance = async (publicKey: PublicKey | null) => {
  if (!publicKey) return 0;
  const connection = new Connection(getActiveRpc(), COMMITMENT);

  const solBalance = await connection.getBalance(publicKey);
  const bnValue = new BN(solBalance.toString());

  return adjustDecimals(bnValue);
};

export const getTokenBalance = async (
  connection: Connection | undefined,
  mintAddress: string,
  decimals: number,
  publicKey: PublicKey | null,
) => {
  if (!publicKey || !connection) return new Decimal(0);
  const ata = getAssociatedTokenAddressSync(
    new PublicKey(mintAddress),
    publicKey,
    true,
  );
  const t = await getAccount(connection, ata, COMMITMENT);
  return adjustDecimals(new BN(t.amount?.toString()), decimals);
};

export const waitForTransaction = (
  signature: string,
  confirmationStatus: "processed" | "confirmed" | "finalized" = "confirmed",
  timeout = 120_000,
) => {
  return new Promise((resolve, reject) => {
    const connection = new Connection(getActiveRpc(), COMMITMENT);
    const startTime = Date.now();

    const checkTransactionStatus = async () => {
      try {
        const statuses = await connection.getSignatureStatuses([signature], {
          searchTransactionHistory: true,
        });
        const status = statuses?.value[0];

        if (status) {
          if (status.err) {
            return reject(
              new Error(`Transaction failed: ${JSON.stringify(status.err)}`),
            );
          }

          if (
            status.confirmationStatus === confirmationStatus ||
            status.confirmationStatus === "finalized"
          ) {
            return resolve(true);
          }
        }

        if (Date.now() - startTime > timeout) {
          return reject(new Error("Transaction confirmation timed out"));
        }

        setTimeout(checkTransactionStatus, 5_000);
      } catch (error) {
        reject(error);
      }
    };

    checkTransactionStatus();
  });
};

export const createPriorityFeeInstruction = (
  priorityFee: number,
  computeUnits: number = 300_000, // ~ 1_400_000 CU
): TransactionInstruction[] => {
  const priority_fee_in_lamports = priorityFee * 1_000_000_000;

  const set_compute_unit_price_ix = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: Math.floor(
      (priority_fee_in_lamports * 1_000_000) / computeUnits,
    ),
  });
  const set_compute_unit_limit_ix = ComputeBudgetProgram.setComputeUnitLimit({
    units: computeUnits,
  });

  return [set_compute_unit_price_ix, set_compute_unit_limit_ix];
};

export const adjustDecimals = (
  amount: number | BN | Decimal,
  decimals: number = 9,
) => {
  return new Decimal(amount.toString())
    .div(new Decimal(10).pow(decimals))
    .toNumber();
};

export const showTransactionState = async (
  signature: string,
  explorerKey: keyof typeof SOL_EXPLORERS,
  confirmationStatus: "processed" | "confirmed" | "finalized" = "confirmed",
) => {
  if (typeof signature !== "string") return;
  const link = getExplorerLink(explorerKey, signature);
  const notificationId = notifications.show({
    withBorder: true,
    title: "Waiting for confirmation",
    message: (
      <>
        Your transaction{" "}
        <Anchor href={link} target="_blank" rel="noreferrer">
          {walletAddressToShorten(signature)}
        </Anchor>{" "}
        was sent. Waiting for confirmation...
      </>
    ),
    loading: true,
    autoClose: false,
  });
  try {
    await waitForTransaction(signature, confirmationStatus);
    notifications.update({
      id: notificationId,
      color: "green",
      loading: false,
      title: "Transaction confirmed",
      autoClose: 10_000,
      message: (
        <>
          Your transaction{" "}
          <Anchor href={link} target="_blank" rel="noreferrer">
            {walletAddressToShorten(signature)}
          </Anchor>{" "}
          was confirmed
        </>
      ),
      icon: <IconCheck />,
    });
  } catch (error) {
    notifications.update({
      id: notificationId,
      color: "red",
      loading: false,
      title: "Transaction failed",
      autoClose: 10_000,
      message: error instanceof Error ? error.message : "Something went wrong",
      icon: <IconX />,
    });
    console.error("Transaction failed:", error);
  }
};
