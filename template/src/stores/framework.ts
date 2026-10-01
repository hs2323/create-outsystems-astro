import { atom } from "nanostores";

export type CurrentSelectedFramework =
  | ""
  | "Alpine.js"
  | "Lit"
  | "Preact"
  | "React"
  | "Solid"
  | "Svelte"
  | "VanillaJS"
  | "Vue";

export const framework = atom<CurrentSelectedFramework>("");
