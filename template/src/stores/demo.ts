import { atom } from "nanostores";

export function setupStore(name: string) {
  // @ts-expect-error: Stores does not exist on window
  if (window.Stores === undefined) {
    // @ts-expect-error: Stores does not exist on window
    window.Stores = [];
    // @ts-expect-error: Stores does not exist on window
    window.Stores[name] = atom("Test Value");
  }

  // @ts-expect-error: Stores does not exist on window
  return window.Stores[name];
}
