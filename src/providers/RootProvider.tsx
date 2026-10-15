import {
  type PropsWithChildren,
  useMemo,
} from "react";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import {
  getGfmUsdRateOptions,
  getSolUsdRateOptions,
} from "../query/queryOptions";
import {
  DEFAULT_PRIORITY_FEE,
  PUBLIC_RPC_URL,
  SOL_EXPLORERS,
  type ExplorerKey,
  type RpcType,
} from "../constants";
import useLocalStorage from "../hooks/useLocalStorage";
import { checkIsValidUrl } from "../utils";
import { RootContext, type RootContextType } from "./RootContext";

export const RootProvider = ({ children }: PropsWithChildren) => {
  const { data: solRate } = useQuery(getSolUsdRateOptions());
  const { data: gfmRate } = useQuery(getGfmUsdRateOptions());
  const [isFeeModalOpen, { open: openFeeModal, close: closeFeeModal }] =
    useDisclosure(false);
  const [priorityFee, setPriorityFee] = useLocalStorage(
    "priorityFee",
    DEFAULT_PRIORITY_FEE,
  );
  const [explorer, setExplorer] = useLocalStorage<ExplorerKey>(
    "explorer",
    [...Object.keys(SOL_EXPLORERS)][0] as ExplorerKey,
  );
  const [rpcType, setRpcType] = useLocalStorage<RpcType>("rpcType", "public");
  const [customRpc, setCustomRpc] = useLocalStorage<string>("customRpc", "");

  const activeRpc = useMemo(() => {
    if (rpcType === "custom" && customRpc && checkIsValidUrl(customRpc)) {
      return customRpc.trim();
    }
    return PUBLIC_RPC_URL;
  }, [rpcType, customRpc]);

  const value = useMemo<RootContextType>(
    () => ({
      isFeeModalOpen,
      openFeeModal,
      closeFeeModal,
      priorityFee,
      setPriorityFee,
      solRate: solRate ?? undefined,
      gfmRate: gfmRate ?? undefined,
      explorer,
      setExplorer,
      rpcType,
      setRpcType,
      customRpc,
      setCustomRpc,
      activeRpc,
    }),
    [
      isFeeModalOpen,
      openFeeModal,
      closeFeeModal,
      priorityFee,
      setPriorityFee,
      solRate,
      gfmRate,
      explorer,
      setExplorer,
      rpcType,
      setRpcType,
      customRpc,
      setCustomRpc,
      activeRpc,
    ],
  );

  return <RootContext.Provider value={value}>{children}</RootContext.Provider>;
};

export default RootProvider;
