import {
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  createContext,
} from "react";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import {
  getGfmUsdRateOptions,
  getSolUsdRateOptions,
} from "../query/queryOptions";
import type { ExplorerKey } from "../constants";
import useLocalStorage from "../hooks/useLocalStorage";

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

  const value: RootServiceType = {
    isFeeModalOpen,
    openFeeModal,
    closeFeeModal,
    priorityFee,
    setPriorityFee,
    solRate,
    gfmRate,
    explorer,
    setExplorer,
  };

  return <RootContext.Provider value={value}>{children}</RootContext.Provider>;
};
