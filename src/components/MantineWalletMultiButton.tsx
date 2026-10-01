import React, { useCallback } from "react";
import { Avatar, Button, type ButtonProps } from "@mantine/core";
import {
  useWallet,
  WalletNotSelectedError,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  useWalletModal,
} from "@solana/wallet-adapter-react-ui";

interface CustomWalletButtonProps extends ButtonProps {
  children?: React.ReactNode;
}

const MantineWalletMultiButton: React.FC<CustomWalletButtonProps> = (props) => {
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

  const handleClick = useCallback(async () => {
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
        console.error("Wallet not selected");
        setVisible(true);
      } else {
        console.error(error);
      }
    }
  }, [connected, wallet, connect, disconnect, setVisible]);

  return (
    <WalletModalProvider>
      <Button
        onClick={handleClick}
        loading={connecting || disconnecting}
        leftSection={
          connected && wallet ? (
            <Avatar
              src={wallet.adapter.icon}
              alt={wallet.adapter.name}
              radius="xs"
              size="1.5em"
            />
          ) : undefined
        }
        {...props}
      >
        {connected && publicKey
          ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
          : props.children || "connect wallet"}
      </Button>
    </WalletModalProvider>
  );
};

export default MantineWalletMultiButton;
