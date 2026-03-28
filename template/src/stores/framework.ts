import { atom } from "nanostores";

export type CurrentSelectedFramework =
  | ""
  | "Preact"
  | "React"
  | "Solid"
  | "Svelte"
  | "Vue";

export const framework = atom<CurrentSelectedFramework>("");
