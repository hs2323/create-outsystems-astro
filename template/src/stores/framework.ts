import { atom } from "nanostores";

export type CurrentSelectedFramework =
  | ""
  | "Alpine.js"
  | "Preact"
  | "React"
  | "Solid"
  | "Svelte"
  | "VanillaJS"
  | "Vue";

export const framework = atom<CurrentSelectedFramework>("");
