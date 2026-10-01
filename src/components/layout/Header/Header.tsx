import {
  Group,
  Button,
  Flex,
  useComputedColorScheme,
  Divider,
} from "@mantine/core";
import classes from "./Header.module.css";
import { Link, useLocation } from "@tanstack/react-router";
import ProfileMenu from "./ProfileMenu/ProfileMenu";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import RootSettings from "./RootSettings";
import Logo from "../../img/Logo";

const Header = () => {
  const location = useLocation();
  const computedColorScheme = useComputedColorScheme(undefined, {
    getInitialValueInEffect: false,
  });
  const { publicKey } = useWallet();

  const currentPage = location?.pathname?.split("/")[1];

  return (
    <header
      className={classes.header}
      data-big-p={currentPage !== "memefeed" && currentPage !== "campaigns"}
    >
      <Group gap={4} justify="space-between" wrap="nowrap" align="center">
        <Flex
          justify="space-between"
          wrap="nowrap"
          align="center"
          gap={{ base: "xs", lg: "xl" }}
        >
          <Group justify="space-between" wrap="nowrap" align="center" gap="xs">
            <Button
              component={Link}
              to="/"
              variant="transparent"
              color={computedColorScheme === "dark" ? "white" : "dark"}
              px={0}
              style={{
                flexShrink: 0,
              }}
            >
              <Logo height={24} width="auto" fill="currentColor" />
            </Button>
          </Group>
        </Flex>
        <Group gap="xs">
          <Flex align="center" gap={{ base: 1 }} wrap="nowrap">
            {publicKey ? (
              <ProfileMenu />
            ) : (
              <WalletMultiButton
                style={{
                  backgroundColor: "var(--mantine-color-gray-light)",
                  color: "light-dark(#000, #fff)",
                  padding:
                    "var(--mantine-spacing-xs) var(--mantine-spacing-sm)",
                  height: 42,
                  lineHeight: 1,
                  fontWeight: 600,
                  borderTopLeftRadius: 12,
                  borderBottomLeftRadius: 12,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                }}
              />
            )}
            <Divider />
            <RootSettings />
          </Flex>
        </Group>
      </Group>
    </header>
  );
};

export default Header;
