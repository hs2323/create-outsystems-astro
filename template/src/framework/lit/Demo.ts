import { StoreController } from "@nanostores/lit";
import { html, LitElement, unsafeCSS } from "lit";

import AstroLogo from "../../images/astro.png?url";
import OutSystemsLogo from "../../images/outsystems.png?url";
import { Operation, setCounterCount } from "../../lib/setCounterCount";
import { setupStore } from "../../stores/demo";
import styles from "../../styles/index.css?inline";

export default class Demo extends LitElement {
  static override properties = {
    count: { state: true },
    initialCount: { type: Number },
    showMessage: { type: String },
  };

  // The page stylesheet does not reach into the shadow root, so the component
  // adopts it.
  static override styles = unsafeCSS(styles);

  declare count: number | undefined;
  declare initialCount: number;
  declare showMessage: string;

  private store = new StoreController(this, setupStore("litStore"));

  // The count starts from `initialCount` and is kept once the user changes it.
  private get currentCount(): number {
    return this.count ?? this.initialCount;
  }

  constructor() {
    super();
    this.initialCount = 0;
    this.showMessage = "";
  }

  override render() {
    const count = this.currentCount;

    return html`
      <slot name="header"></slot>
      <div class="card-grid">
        <div class="card">
          <strong>Lit counter component</strong>
          <div class="card-content">
            Internal counter controls. It keeps state within the component.
            <div class="counter-controls">
              <button @click=${() => this.changeCount(Operation.Subtract)}>
                -
              </button>
              <pre>${count}</pre>
              <button @click=${() => this.changeCount(Operation.Add)}>+</button>
            </div>
          </div>
          The button sends the current count value to a function in the parent
          component.
          <div class="card-content">
            <div>
              <button class="card-btn" @click=${this.showParentMessage}>
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
              <div class="nanostore-value">${this.store.value}</div>
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
        <img alt="OutSystems logo" src=${OutSystemsLogo} />
        <img alt="Astro logo" src=${AstroLogo} />
      </div>
    `;
  }

  private changeCount(operation: Operation) {
    this.count = setCounterCount(this.currentCount, operation);
  }

  private showParentMessage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (window as any)[this.showMessage];
    if (typeof handler === "function") handler(this.currentCount);
  }
}

if (typeof window !== "undefined" && !customElements.get("lit-demo")) {
  customElements.define("lit-demo", Demo);
}
