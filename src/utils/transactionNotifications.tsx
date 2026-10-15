import { Anchor } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import type { SOL_EXPLORERS } from "../constants";
import { getExplorerLink, walletAddressToShorten } from "../utils";
import { waitForTransaction } from "../solana/utils";

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

