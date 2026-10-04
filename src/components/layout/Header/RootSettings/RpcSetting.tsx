import { ActionIcon, Box, Group, Select, Text, TextInput } from "@mantine/core";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { RPC_SELECT_DATA } from "../../../../constants";
import type { useRpcSettings } from "./useRpcSettings";

type RpcSettingProps = Pick<
  ReturnType<typeof useRpcSettings>,
  | "selectedRpcType"
  | "customRpcInput"
  | "isCheckingRpc"
  | "rpcError"
  | "hasUrlError"
  | "canSaveCustomRpc"
  | "setCustomRpcInput"
  | "setRpcError"
  | "handleRpcSelectChange"
  | "handleSaveCustomRpc"
>;

export const RpcSetting = ({
  selectedRpcType,
  customRpcInput,
  isCheckingRpc,
  rpcError,
  hasUrlError,
  canSaveCustomRpc,
  setCustomRpcInput,
  setRpcError,
  handleRpcSelectChange,
  handleSaveCustomRpc,
}: RpcSettingProps) => {
  return (
    <>
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
          data={RPC_SELECT_DATA}
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
              error={hasUrlError ? "Invalid URL format" : rpcError || undefined}
              w="100%"
              variant="filled"
              size="sm"
              aria-label="Custom RPC URL"
            />
            <ActionIcon
              color="green"
              size={36}
              variant="filled"
              loading={isCheckingRpc}
              disabled={!canSaveCustomRpc}
              onClick={handleSaveCustomRpc}
              title="Verify & Save RPC"
              aria-label="Verify and save custom RPC"
            >
              <IconDeviceFloppy size={18} />
            </ActionIcon>
          </Group>
        </Box>
      )}
    </>
  );
};
