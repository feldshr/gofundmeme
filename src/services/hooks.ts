import { useContext } from "react";
import { RootContext } from "./RootService";
import { ProviderContext } from "./AnchorProvider";
import { StakingContext } from "./StakingService";

export function useRoot() {
  return useContext(RootContext);
}

export function useAnchorProvider() {
  return useContext(ProviderContext);
}

export function useStaking() {
  return useContext(StakingContext);
}
