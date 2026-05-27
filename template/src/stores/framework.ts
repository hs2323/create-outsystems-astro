import { atom } from "nanostores";

export type CurrentSelectedFramework =
  | ""
  | "HTML"
  | "Preact"
  | "React"
  | "Solid"
  | "Svelte"
  | "Vue";

export const framework = atom<CurrentSelectedFramework>("");
