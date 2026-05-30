import { atom } from "nanostores";

export type CurrentSelectedFramework =
  | ""
  | "HTML"
  | "Preact"
  | "React"
  | "Solid"
  | "Svelte"
  | "Twig"
  | "Vue";

export const framework = atom<CurrentSelectedFramework>("");
