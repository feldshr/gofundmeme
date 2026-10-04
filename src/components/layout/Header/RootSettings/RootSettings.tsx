import { useState } from "react";
import { ActionIcon, Divider, Popover, Title } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { PriorityFeeSetting } from "./PriorityFeeSetting";
import { ExplorerSetting } from "./ExplorerSetting";
import { RpcSetting } from "./RpcSetting";
import { ThemeSetting } from "./ThemeSetting";
import { useRpcSettings } from "./useRpcSettings";

const RootSettings = () => {
  const [opened, setOpened] = useState(false);
  const rpc = useRpcSettings();

  const handlePopoverChange = (nextOpen: boolean) => {
    if (!nextOpen && rpc.isCheckingRpc) {
      return;
    }
    setOpened(nextOpen);

    if (nextOpen) {
      rpc.handlePopoverOpen();
    }
  };

  return (
    <Popover
      opened={opened}
      onChange={handlePopoverChange}
      onExitTransitionEnd={rpc.handleExitTransitionEnd}
      closeOnClickOutside={!rpc.isCheckingRpc}
      closeOnEscape={!rpc.isCheckingRpc}
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
          disabled={rpc.isCheckingRpc}
          aria-label="Settings"
          style={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
          }}
          onClick={() => !rpc.isCheckingRpc && handlePopoverChange(!opened)}
        >
          <IconSettings stroke={1.75} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Title order={3} mb="sm">
          Settings
        </Title>
        <PriorityFeeSetting />
        <Divider my="sm" />
        <ExplorerSetting />
        <Divider my="sm" />
        <RpcSetting {...rpc} />
        <Divider my="sm" />
        <ThemeSetting />
      </Popover.Dropdown>
    </Popover>
  );
};

export default RootSettings;
