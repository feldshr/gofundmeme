import { createContext, useContext } from "react";
import type { AnchorProvider as Provider } from "@coral-xyz/anchor";

export type AnchorContextType = {
  anchorProvider: Provider | null;
};

export const AnchorContext = createContext<AnchorContextType | null>(null);

export const useAnchorProvider = () => {
  const context = useContext(AnchorContext);
  if (!context) {
    throw new Error("useAnchorProvider must be used within an AnchorProvider");
  }
  return context;
};

