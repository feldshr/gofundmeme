import {
  ActionIcon,
  Popover,
  Title,
  Text,
  NumberInput,
  Group,
  Box,
  Divider,
  Select,
  useMantineColorScheme,
  SegmentedControl,
  Center,
  type MantineColorScheme,
} from "@mantine/core";
import {
  IconMoonFilled,
  IconSettings,
  IconSunFilled,
  IconSunMoon,
} from "@tabler/icons-react";
import { useRoot } from "../../../services/hooks";
import SolanaLogo from "../../img/SolanaLogo";
import { EXPLORER_SELECT_DATA, type ExplorerKey } from "../../../constants";

const RootSettings = () => {
  const { priorityFee, setPriorityFee, explorer, setExplorer } = useRoot();
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <Popover
      width={320}
      shadow="md"
      radius="lg"
      withOverlay
      overlayProps={{ zIndex: 100, blur: "1px" }}
      zIndex={101}
      clickOutsideEvents={["mouseup", "touchend"]}
    >
      <Popover.Target>
        <ActionIcon
          variant="light"
          color="gray"
          h={42}
          w={42}
          size="md"
          radius={12}
          style={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
        >
          <IconSettings stroke={1.75} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Title order={3} mb="sm">
          Settings
        </Title>
        <Box>
          <Group wrap="nowrap" justify="space-between">
            <Text>Priority fee</Text>
            <NumberInput
              w={172}
              allowNegative={false}
              decimalScale={5}
              thousandSeparator=","
              placeholder="0.00001"
              step={0.00001}
              min={0.00001}
              leftSection={
                <SolanaLogo
                  color="var(--mantine-color-bright)"
                  fontSize="14px"
                />
              }
              inputWrapperOrder={["label", "input", "description"]}
              value={priorityFee}
              onChange={(value) => {
                setPriorityFee(typeof value === "string" ? 0.00001 : value);
              }}
            />
          </Group>
          <Text c="dimmed" size="xs" mt={4} lh={1.1}>
            Prioritizing the fee helps boost the transaction processing speed
            against others, resulting in faster confirmation time
          </Text>
        </Box>
        <Divider my="sm" />
        <Group wrap="nowrap" align="center" justify="space-between">
          <Text lh="inherit" fz="inherit" fw="inherit">
            Explorer
          </Text>
          <Select
            w={172}
            value={explorer}
            allowDeselect={false}
            onChange={(value) => {
              if (!value) return;
              setExplorer(value as ExplorerKey);
            }}
            data={EXPLORER_SELECT_DATA}
            comboboxProps={{ withinPortal: false }}
          />
        </Group>
        <Divider my="sm" />
        <Group wrap="nowrap" align="center" justify="space-between">
          <Text lh="inherit" fz="inherit" fw="inherit">
            RPC
          </Text>
          <Select
            w={172}
            value={explorer}
            allowDeselect={false}
            onChange={(value) => {
              if (!value) return;
              setExplorer(value as ExplorerKey);
            }}
            data={[
              {
                value: "helius",
                label: "Helius (GoFundMeme)",
              },
              {
                value: "public",
                label: "dRpc (public)",
              },
              {
                value: "custom",
                label: "Custom",
              },
            ]}
            comboboxProps={{ withinPortal: false }}
          />
        </Group>
        <Text c="dimmed" size="xs" mt={4} lh={1.1}>
          Prioritizing the fee helps boost the transaction processing speed
          against others, resulting in faster confirmation time
        </Text>
        <Divider my="sm" />
        <Group wrap="nowrap" justify="space-between">
          <Text>Theme</Text>
          <SegmentedControl
            size="xs"
            radius="sm"
            data={[
              {
                value: "auto",
                label: (
                  <Center style={{ gap: 2 }}>
                    <IconSunMoon size={14} />
                    <span>Auto</span>
                  </Center>
                ),
              },
              {
                value: "light",
                label: (
                  <Center style={{ gap: 2 }}>
                    <IconSunFilled size={14} />
                    <span>Light</span>
                  </Center>
                ),
              },
              {
                value: "dark",
                label: (
                  <Center style={{ gap: 2 }}>
                    <IconMoonFilled size={14} />
                    <span>Dark</span>
                  </Center>
                ),
              },
            ]}
            value={colorScheme}
            onChange={(value) => {
              setColorScheme(value as MantineColorScheme);
            }}
          />
        </Group>
      </Popover.Dropdown>
    </Popover>
  );
};

export default RootSettings;
