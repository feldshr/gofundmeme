import { type ComponentPropsWithoutRef } from "react";
import { Avatar, Button, type ButtonProps } from "@mantine/core";
import { useWalletAction } from "./useWalletAction";
import { walletAddressToShorten } from "../../utils";

export interface ConnectWalletButtonProps
  extends ButtonProps,
    Omit<ComponentPropsWithoutRef<"button">, keyof ButtonProps> {
  onConnectError?: (error: unknown) => void;
}

/**
 * Atomic Mantine button that handles wallet connection, disconnection,
 * and loading states using the headless useWalletAction hook.
 */
export const ConnectWalletButton = ({
  children,
  onClick,
  onConnectError,
  ...buttonProps
}: ConnectWalletButtonProps) => {
  const { wallet, publicKey, connected, loading, handleClick } =
    useWalletAction({
      onClick,
      onError: onConnectError,
    });

  return (
    <Button
      {...buttonProps}
      onClick={handleClick}
      loading={loading}
      title={
        connected && publicKey
          ? walletAddressToShorten(publicKey.toBase58())
          : undefined
      }
      leftSection={
        connected && wallet ? (
          <Avatar
            src={wallet.adapter.icon}
            alt={wallet.adapter.name}
            radius="xs"
            size={18}
          />
        ) : undefined
      }
    >
      {connected ? "Disconnect" : children || "Connect Wallet"}
    </Button>
  );
};

export default ConnectWalletButton;

