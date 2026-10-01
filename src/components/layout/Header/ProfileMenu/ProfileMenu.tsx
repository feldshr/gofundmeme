import { Group, Menu, Text, Divider, CopyButton, Button } from "@mantine/core";
import { IconCheck, IconCopy, IconLogout } from "@tabler/icons-react";
import SolanaLogo from "../../../img/SolanaLogo";
import { useWallet } from "@solana/wallet-adapter-react";
import classes from "./ProfileMenu.module.css";
import useSolanaWalletBalance from "../../../../hooks/queries/useSolanaWalletBalance";
import { walletAddressToShorten } from "../../../../utils";

const ProfileMenu = () => {
  const { solBalance } = useSolanaWalletBalance();
  const { publicKey, disconnect } = useWallet();

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <Group justify="center">
      <Menu
        withArrow
        position="bottom"
        arrowSize={10}
        arrowOffset={12}
        radius="md"
        width={160}
        transitionProps={{ transition: "fade-up", duration: 150 }}
      >
        <Menu.Target>
          <Button
            variant="light"
            radius={12}
            color="gray"
            py={{
              base: 4,
              xs: 8,
            }}
            px={{
              base: "xs",
              xs: "sm",
            }}
            size="sm"
            style={{
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0,
            }}
            className={classes.targetButton}
          >
            {typeof solBalance !== "undefined" && (
              <>
                <Group
                  wrap="nowrap"
                  align="center"
                  gap={2}
                  fz={{
                    base: 12,
                    xs: "inherit",
                  }}
                  c="var(--mantine-color-dimmed)"
                >
                  <SolanaLogo fontSize="0.725em" color="inherit" />
                  <Text fw={600} fz="inherit" lh={1.2}>
                    {solBalance?.toLocaleString("en-US", {
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </Group>
                <Divider
                  orientation="vertical"
                  mx={8}
                  my={4}
                  style={{ borderColor: "var(--mantine-color-dimmed)" }}
                  display={{
                    base: "none",
                    xs: "block",
                  }}
                />
              </>
            )}
            <Text fw={500} c="light-dark(#000, #fff)" fz="inherit" lh={1.2}>
              {walletAddressToShorten(publicKey?.toString())}
            </Text>
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          {publicKey && (
            <CopyButton value={publicKey?.toString()} timeout={2000}>
              {({ copied, copy }) => (
                <Menu.Item
                  leftSection={
                    copied ? (
                      <IconCheck size="1.1rem" stroke={1.5} color="green" />
                    ) : (
                      <IconCopy size="1.1rem" stroke={1.5} />
                    )
                  }
                  closeMenuOnClick={false}
                  disabled={copied}
                  onClick={copy}
                >
                  <Text c={publicKey ? "dimmed" : undefined} fz="inherit">
                    {copied ? "Copied" : "Copy address"}
                  </Text>
                </Menu.Item>
              )}
            </CopyButton>
          )}
          <Menu.Item
            leftSection={<IconLogout size={18} stroke={1.5} />}
            onClick={handleDisconnect}
          >
            <Text c={publicKey ? "dimmed" : undefined} fz="inherit">
              Disconnect
            </Text>
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};

export default ProfileMenu;
