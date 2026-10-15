import {
  type Dispatch,
  type SetStateAction,
  createContext,
  useContext,
} from "react";
import type { ExplorerKey, RpcType } from "../constants";

export type { RpcType };

export type RootContextType = {
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

export const RootContext = createContext<RootContextType | null>(null);

export const useRoot = () => {
  const context = useContext(RootContext);
  if (!context) {
    throw new Error("useRoot must be used within a RootProvider");
  }
  return context;
};

