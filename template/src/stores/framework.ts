import { atom } from "nanostores";

export type CurrentSelectedFramework =
  | ""
  | "Preact"
  | "React"
  | "Svelte"
  | "Vue";

export const framework = atom<CurrentSelectedFramework>("");
