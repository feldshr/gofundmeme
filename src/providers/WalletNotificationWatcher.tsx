import { useEffect, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { notifications } from "@mantine/notifications";
import { Avatar } from "@mantine/core";
import { IconWallet, IconWalletOff } from "@tabler/icons-react";
import { walletAddressToShorten } from "../utils";

export const WalletNotificationWatcher = () => {
  const { wallet, publicKey, connecting } = useWallet();
  const isInitializedRef = useRef(false);
  const previousAddressRef = useRef<string | null>(null);
  const previousWalletRef = useRef(wallet);

  useEffect(() => {
    // Keep track of the last active wallet
    if (wallet) {
      previousWalletRef.current = wallet;
    }

    // Wait until initial auto-connect attempt finishes before listening for changes
    if (connecting) return;

    const currentAddress = publicKey?.toBase58() ?? null;

    // Skip notification on initial application load
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      previousAddressRef.current = currentAddress;
      return;
    }

    const previousAddress = previousAddressRef.current;

    if (previousAddress !== currentAddress) {
      previousAddressRef.current = currentAddress;

      if (currentAddress) {
        const shortAddress = walletAddressToShorten(currentAddress);
        const iconUrl = wallet?.adapter.icon;
        const walletName = wallet?.adapter.name ?? "Wallet";

        notifications.show({
          color: "blue",
          title: "Wallet connected",
          message: `Connected to wallet ${shortAddress}`,
          icon: iconUrl ? (
            <Avatar src={iconUrl} alt={walletName} size={24} radius="xl">
              <IconWallet size={24} stroke={1.5} />
            </Avatar>
          ) : (
            <IconWallet size={24} stroke={1.5} />
          ),
          withBorder: true,
        });
      } else if (previousAddress) {
        notifications.show({
          color: "yellow",
          title: "Wallet disconnected",
          message: "Wallet has been disconnected",
          icon: <IconWalletOff size={24} stroke={1.5} />,
          withBorder: true,
        });
      }
    }
  }, [wallet, publicKey, connecting]);

  return null;
};

export default WalletNotificationWatcher;
