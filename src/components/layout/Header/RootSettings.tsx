import { useState } from "react";
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
  TextInput,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconCheck,
  IconDeviceFloppy,
  IconMoonFilled,
  IconSettings,
  IconSunFilled,
  IconSunMoon,
  IconX,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useRoot } from "../../../services/hooks";
import SolanaLogo from "../../img/SolanaLogo";
import { EXPLORER_SELECT_DATA, type ExplorerKey } from "../../../constants";
import { checkIsValidUrl, checkRpcHealth } from "../../../utils";
import type { RpcType } from "../../../services/RootService";

const RootSettings = () => {
  const {
    priorityFee,
    setPriorityFee,
    explorer,
    setExplorer,
    rpcType,
    setRpcType,
    customRpc,
    setCustomRpc,
  } = useRoot();
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const [opened, setOpened] = useState(false);
  const [selectedRpcType, setSelectedRpcType] = useState<RpcType>(rpcType);
  const [customRpcInput, setCustomRpcInput] = useState<string>(customRpc);
  const [isCheckingRpc, setIsCheckingRpc] = useState(false);
  const [rpcError, setRpcError] = useState<string | null>(null);

  // Handle popover open/close:
  const handlePopoverChange = (nextOpen: boolean) => {
    if (!nextOpen && isCheckingRpc) {
      return;
    }
    setOpened(nextOpen);

    if (nextOpen) {
      setSelectedRpcType(rpcType);
      setCustomRpcInput(customRpc);
      setRpcError(null);
    }
  };

  const handleExitTransitionEnd = () => {
    // If popover closed with "custom" in dropdown, but active RPC is "public"
    // (e.g. empty input, unverified URL, or failed verification)
    // -> Reset the UI back to public and show warning notification
    if (selectedRpcType === "custom" && rpcType === "public") {
      setSelectedRpcType("public");
      setCustomRpcInput(customRpc);
      setRpcError(null);
      notifications.show({
        color: "yellow",
        title: "RPC reset",
        message: "Using Public RPC (Allnodes)",
        icon: <IconAlertTriangle size={18} stroke={1.5} />,
        withBorder: true,
      });
    } else if (selectedRpcType === "custom" && rpcType === "custom") {
      // If user typed unsaved characters, revert the input back to active saved customRpc
      if (customRpcInput.trim() !== customRpc.trim()) {
        setCustomRpcInput(customRpc);
      }
      setRpcError(null);
    } else {
      setRpcError(null);
    }
  };

  const handleRpcSelectChange = (value: string | null) => {
    if (!value) return;
    const type = value as RpcType;
    setSelectedRpcType(type);
    setRpcError(null);

    // Apply immediately and notify in green
    if (type === "public") {
      if (rpcType !== "public") {
        setRpcType("public");
        notifications.show({
          color: "green",
          title: "RPC",
          message: "Using Public RPC (Allnodes)",
          icon: <IconCheck size={18} stroke={1.5} />,
          withBorder: true,
        });
      }
    } else if (type === "custom") {
      // If user already has a saved valid custom RPC, apply it immediately
      if (customRpc && checkIsValidUrl(customRpc)) {
        if (rpcType !== "custom") {
          setRpcType("custom");
          notifications.show({
            color: "green",
            title: "RPC",
            message: "Using Custom RPC",
            icon: <IconCheck size={18} stroke={1.5} />,
            withBorder: true,
          });
        }
      }
    }
  };

  const trimmedInput = customRpcInput.trim();
  const isUrlValid = checkIsValidUrl(trimmedInput);
  const hasUrlError = Boolean(trimmedInput && !isUrlValid);

  const canSaveCustomRpc =
    Boolean(trimmedInput) && isUrlValid && !isCheckingRpc;

  const handleSaveCustomRpc = async () => {
    if (!trimmedInput) {
      setRpcError("Please enter an RPC URL");
      return;
    }

    if (!isUrlValid) {
      setRpcError("Invalid URL format");
      return;
    }

    setIsCheckingRpc(true);
    setRpcError(null);

    const result = await checkRpcHealth(trimmedInput);
    setIsCheckingRpc(false);

    if (result.ok) {
      // Сохраняем в local storage только успешный rpc
      setCustomRpc(trimmedInput);
      setRpcType("custom");
      setRpcError(null);

      notifications.show({
        color: "green",
        title: "Custom RPC Connected",
        message: `Response time: ${result.latency}ms${result.version ? ` • v${result.version}` : ""}`,
        icon: <IconCheck size={18} stroke={1.5} />,
        withBorder: true,
      });
    } else {
      // Если введен другой и не прошел проверку - удаляем сохраненный rpc
      setCustomRpc("");
      setRpcType("public");
      setRpcError(result.error || "Failed to connect to RPC");

      notifications.show({
        color: "red",
        title: "RPC Connection Failed",
        message: `${result.error || "Could not reach node."} Using Public RPC.`,
        icon: <IconX size={18} stroke={1.5} />,
        withBorder: true,
      });
    }
  };

  return (
    <Popover
      opened={opened}
      onChange={handlePopoverChange}
      onExitTransitionEnd={handleExitTransitionEnd}
      closeOnClickOutside={!isCheckingRpc}
      closeOnEscape={!isCheckingRpc}
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
          disabled={isCheckingRpc}
          style={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
          onClick={() => !isCheckingRpc && handlePopoverChange(!opened)}
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
            value={selectedRpcType}
            allowDeselect={false}
            disabled={isCheckingRpc}
            onChange={handleRpcSelectChange}
            data={[
              {
                value: "public",
                label: "Public (Allnodes)",
              },
              {
                value: "custom",
                label: "Custom",
              },
            ]}
            comboboxProps={{ withinPortal: false }}
          />
        </Group>
        {selectedRpcType === "custom" && (
          <Box mt="xs">
            <Group gap={6} wrap="nowrap" align="flex-start">
              <TextInput
                placeholder="https://mainnet.helius-rpc.com/?api-key=..."
                value={customRpcInput}
                disabled={isCheckingRpc}
                onChange={(e) => {
                  setCustomRpcInput(e.currentTarget.value);
                  setRpcError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canSaveCustomRpc) {
                    handleSaveCustomRpc();
                  }
                }}
                error={
                  hasUrlError ? "Invalid URL format" : rpcError || undefined
                }
                w="100%"
                variant="filled"
                size="sm"
              />
              <ActionIcon
                color="green"
                size={36}
                variant="filled"
                loading={isCheckingRpc}
                disabled={!canSaveCustomRpc}
                onClick={handleSaveCustomRpc}
                title="Verify & Save RPC"
              >
                <IconDeviceFloppy size={18} />
              </ActionIcon>
            </Group>
          </Box>
        )}
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
