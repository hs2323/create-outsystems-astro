import { atom } from "nanostores";

export type CurrentSelectedFramework =
  | ""
  | "Alpine.js"
  | "jQuery"
  | "Lit"
  | "Preact"
  | "React"
  | "Solid"
  | "Svelte"
  | "VanillaJS"
  | "Vue";

export const framework = atom<CurrentSelectedFramework>("");
