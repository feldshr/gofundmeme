import { ActionIcon, Container, Group, Menu, rem, Text } from "@mantine/core";
import {
  IconBrandTelegram,
  IconBrandX,
  IconExternalLink,
} from "@tabler/icons-react";
import classes from "./Footer.module.css";
import GitBook from "../../img/GitBook";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={classes.footer}>
      <Container fluid className={classes.afterFooter}>
        <Text c="dimmed" size="sm" ta="center">
          © Copyright {currentYear} GoFundMeme. All rights reserved.
        </Text>
        <Group
          gap={0}
          className={classes.social}
          justify="flex-end"
          wrap="nowrap"
        >
          <Menu
            withArrow
            arrowSize={10}
            position="top"
            radius="md"
            transitionProps={{ transition: "fade-up" }}
          >
            <Menu.Target>
              <ActionIcon size="lg" color="gray" variant="subtle">
                <GitBook />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                component="a"
                target="_blank"
                href="https://docs.gofundmeme.io/"
                rightSection={<IconExternalLink size={14} stroke={1.5} />}
              >
                For developers
              </Menu.Item>
              <Menu.Item
                component="a"
                target="_blank"
                href="https://tinyurl.com/gfm-creator-guide"
                rightSection={<IconExternalLink size={14} stroke={1.5} />}
              >
                For creators
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          <ActionIcon
            size="lg"
            color="gray"
            variant="subtle"
            component="a"
            href="https://x.com/GoFundMemes"
            target="_blank"
          >
            <IconBrandX
              style={{ width: rem(18), height: rem(18) }}
              stroke={1.5}
            />
          </ActionIcon>
          <ActionIcon
            size="lg"
            color="gray"
            variant="subtle"
            component="a"
            href="https://t.me/gofundmeme"
            target="_blank"
          >
            <IconBrandTelegram
              style={{ width: rem(18), height: rem(18) }}
              stroke={1.5}
            />
          </ActionIcon>
        </Group>
      </Container>
    </footer>
  );
};

export default Footer;
