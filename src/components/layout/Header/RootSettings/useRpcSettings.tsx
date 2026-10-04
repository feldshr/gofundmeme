import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { IconAlertTriangle, IconCheck, IconX } from "@tabler/icons-react";
import { useRoot } from "../../../../services/hooks";
import { checkIsValidUrl, checkRpcHealth } from "../../../../utils";
import type { RpcType } from "../../../../constants";

export const useRpcSettings = () => {
  const { rpcType, setRpcType, customRpc, setCustomRpc } = useRoot();

  const [selectedRpcType, setSelectedRpcType] = useState<RpcType>(rpcType);
  const [customRpcInput, setCustomRpcInput] = useState<string>(customRpc);
  const [isCheckingRpc, setIsCheckingRpc] = useState(false);
  const [rpcError, setRpcError] = useState<string | null>(null);

  const handlePopoverOpen = () => {
    setSelectedRpcType(rpcType);
    setCustomRpcInput(customRpc);
    setRpcError(null);
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
    if (!value || (value !== "public" && value !== "custom")) return;
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
      // Save to local storage only upon successful RPC check
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
      // If entered another RPC and it failed verification - delete saved RPC
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

  return {
    selectedRpcType,
    customRpcInput,
    isCheckingRpc,
    rpcError,
    hasUrlError,
    canSaveCustomRpc,
    setCustomRpcInput,
    setRpcError,
    handlePopoverOpen,
    handleExitTransitionEnd,
    handleRpcSelectChange,
    handleSaveCustomRpc,
  };
};
