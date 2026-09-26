import AlpineLogo from "../../images/alpine.png?url";
import { framework } from "../../stores/framework";
import { registerNanoStores } from "./nanostores";

if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(window as any).Stores) (window as any).Stores = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).Stores["framework"] = framework;

  registerNanoStores();
}

export default function Store(): string {
  return `
  <div
    class="card"
    x-data
    x-nano:selected="window.Stores['framework']"
  >
    <strong>Alpine.js Store</strong>
    <div class="card-content">
      <img alt="Alpine.js logo" height="150" src="${AlpineLogo}" />
      <div>
        <strong>Value:</strong>
        <div class="framework-value" x-text="selected"></div>
      </div>
      <div>
        <button
          class="card-btn"
          x-on:click="window.Stores['framework'].set('Alpine.js')"
        >
          Select Alpine.js
        </button>
      </div>
    </div>
  </div>
`;
}
