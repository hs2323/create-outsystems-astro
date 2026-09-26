import AstroLogo from "../../images/astro.png?url";
import OutSystemsLogo from "../../images/outsystems.png?url";
import { setupStore } from "../../stores/demo";
import { registerNanoStores } from "./nanostores";

if (typeof window !== "undefined") {
  setupStore("alpineStore");

  registerNanoStores();
}

export default function Demo(): string {
  return `
  <slot name="header"></slot>
  <div
    class="card-grid"
    x-data="{ count: initialCount }"
    x-nano:store="window.Stores['alpineStore']"
  >
    <div class="card">
      <strong>Alpine.js counter component</strong>
      <div class="card-content">
        Internal counter controls. It keeps state within the component.
        <div class="counter-controls">
          <button x-on:click="count--">-</button>
          <pre x-text="count"></pre>
          <button x-on:click="count++">+</button>
        </div>
      </div>
      The button sends the current count value to a function in the parent
      component.
      <div class="card-content">
        <div>
          <button
            class="card-btn"
            x-on:click="typeof window[showMessage] === 'function' && window[showMessage](count)"
          >
            Send value
          </button>
        </div>
      </div>
    </div>
    <div class="card">
      <strong>Nano Stores</strong>
      <div class="card-content">
        <div>
          <strong>Value:</strong>
          <div class="nanostore-value" x-text="store"></div>
        </div>
      </div>
    </div>
    <div class="card">
      <strong>Slot content</strong>
      <div class="card-content">
        <div><slot></slot></div>
      </div>
    </div>
  </div>
  <div class="counter-logos">
    <img alt="OutSystems logo" src="${OutSystemsLogo}" />
    <img alt="Astro logo" src="${AstroLogo}" />
  </div>
`;
}
