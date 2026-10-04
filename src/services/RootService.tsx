import {
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  createContext,
  useMemo,
} from "react";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import {
  getGfmUsdRateOptions,
  getSolUsdRateOptions,
} from "../query/queryOptions";
import { PUBLIC_RPC_URL, type ExplorerKey } from "../constants";
import useLocalStorage from "../hooks/useLocalStorage";
import { checkIsValidUrl } from "../utils";

export type RpcType = "public" | "custom";

type RootServiceType = {
  isFeeModalOpen: boolean;
  openFeeModal: () => void;
  closeFeeModal: () => void;
  priorityFee: number;
  setPriorityFee: Dispatch<SetStateAction<number>>;
  solRate?: number;
  gfmRate?: number;
  explorer: ExplorerKey;
  setExplorer: Dispatch<SetStateAction<ExplorerKey>>;
  rpcType: RpcType;
  setRpcType: Dispatch<SetStateAction<RpcType>>;
  customRpc: string;
  setCustomRpc: Dispatch<SetStateAction<string>>;
  activeRpc: string;
};

export const RootContext = createContext<RootServiceType>(
  {} as RootServiceType,
);

export const RootService = ({ children }: PropsWithChildren) => {
  const { data: solRate } = useQuery(getSolUsdRateOptions());
  const { data: gfmRate } = useQuery(getGfmUsdRateOptions());
  const [isFeeModalOpen, { open: openFeeModal, close: closeFeeModal }] =
    useDisclosure(false);
  const [priorityFee, setPriorityFee] = useLocalStorage("priorityFee", 0.0001);
  const [explorer, setExplorer] = useLocalStorage<ExplorerKey>(
    "explorer",
    "solscan",
  );
  const [rpcType, setRpcType] = useLocalStorage<RpcType>("rpcType", "public");
  const [customRpc, setCustomRpc] = useLocalStorage<string>("customRpc", "");

  const activeRpc = useMemo(() => {
    if (rpcType === "custom" && customRpc && checkIsValidUrl(customRpc)) {
      return customRpc.trim();
    }
    return PUBLIC_RPC_URL;
  }, [rpcType, customRpc]);

  const value: RootServiceType = {
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
  };

  return <RootContext.Provider value={value}>{children}</RootContext.Provider>;
};
