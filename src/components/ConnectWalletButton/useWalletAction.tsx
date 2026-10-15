import { useCallback, type MouseEvent } from "react";
import {
  useWallet,
  WalletNotSelectedError,
} from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { notifications } from "@mantine/notifications";
import { IconWalletOff } from "@tabler/icons-react";

export interface UseWalletActionOptions {
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onError?: (error: unknown) => void;
}

/**
 * Headless hook that encapsulates wallet connection, disconnection,
 * modal triggers, and error notifications.
 */
export function useWalletAction(options: UseWalletActionOptions = {}) {
  const {
    wallet,
    connect,
    disconnect,
    connected,
    publicKey,
    connecting,
    disconnecting,
  } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      options.onClick?.(event);
      if (event.defaultPrevented) return;

      try {
        if (connected) {
          await disconnect();
        } else if (wallet) {
          await connect();
        } else {
          setVisible(true);
        }
      } catch (error) {
        if (error instanceof WalletNotSelectedError) {
          setVisible(true);
        } else {
          console.error(error);
          options.onError?.(error);
          notifications.show({
            color: "red",
            title: "Wallet Error",
            message:
              error instanceof Error
                ? error.message
                : "Failed to connect wallet",
            icon: <IconWalletOff size={24} stroke={1.5} />,
            withBorder: true,
          });
        }
      }
    },
    [connected, wallet, connect, disconnect, setVisible, options],
  );

  return {
    wallet,
    publicKey,
    connected,
    connecting,
    disconnecting,
    loading: connecting || disconnecting,
    handleClick,
    openModal: () => setVisible(true),
  };
}

export default useWalletAction;

