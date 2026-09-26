import { NanoStores } from "@nanostores/alpine";

export function registerNanoStores(): void {
  if (window.Alpine) {
    window.Alpine.plugin(NanoStores);
    return;
  }

  document.addEventListener(
    "alpine:init",
    () => window.Alpine?.plugin(NanoStores),
    { once: true },
  );
}
