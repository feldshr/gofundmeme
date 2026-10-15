import { Program, type AnchorProvider } from "@coral-xyz/anchor";
import idl from "../program/gofundmeme.json";
import type { Gofundmeme } from "../program/gofundmeme";
import { GFM_Program } from "./constants";

const programCache = new WeakMap<AnchorProvider, Program<Gofundmeme>>();

/**
 * Returns a cached Anchor Program instance for the given provider.
 * Uses WeakMap to prevent repeated parsing of the 6000+ line IDL and avoid memory leaks.
 */
export const getGfmProgram = (provider: AnchorProvider): Program<Gofundmeme> => {
  let program = programCache.get(provider);
  if (!program) {
    program = new Program<Gofundmeme>(idl as Gofundmeme, GFM_Program.toString(), provider);
    programCache.set(provider, program);
  }
  return program;
};

