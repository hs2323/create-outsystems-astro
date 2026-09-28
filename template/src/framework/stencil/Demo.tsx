/** @jsxImportSource @stencil/core */
import { Component, Prop, State } from "@stencil/core";

import AstroLogo from "../../images/astro.png?url";
import OutSystemsLogo from "../../images/outsystems.png?url";
import { Operation, setCounterCount } from "../../lib/setCounterCount";
import { setupStore } from "../../stores/demo";
import styles from "../../styles/index.css?inline";

// The page stylesheet does not reach into the shadow root, so the component
// adopts it.
@Component({ shadow: true, styles, tag: "stencil-demo" })
export default class Demo {
  @State() count: number | undefined;
  @Prop() initialCount = 0;
  @Prop() showMessage = "";
  @State() storeValue = "";

  private unsubscribe?: () => void;

  // The count starts from `initialCount` and is kept once the user changes it.
  private get currentCount(): number {
    return this.count ?? this.initialCount;
  }

  connectedCallback() {
    this.unsubscribe = setupStore("stencilStore").subscribe(
      (value: string) => (this.storeValue = value),
    );
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  render() {
    return [
      <slot name="header" />,
      <div class="card-grid">
        <div class="card">
          <strong>Stencil counter component</strong>
          <div class="card-content">
            Internal counter controls. It keeps state within the component.
            <div class="counter-controls">
              <button onClick={() => this.changeCount(Operation.Subtract)}>
                -
              </button>
              <pre>{this.currentCount}</pre>
              <button onClick={() => this.changeCount(Operation.Add)}>+</button>
            </div>
          </div>
          The button sends the current count value to a function in the parent
          component.
          <div class="card-content">
            <div>
              <button class="card-btn" onClick={() => this.showParentMessage()}>
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
              <div class="nanostore-value">{this.storeValue}</div>
            </div>
          </div>
        </div>
        <div class="card">
          <strong>Slot content</strong>
          <div class="card-content">
            <div>
              <slot />
            </div>
          </div>
        </div>
      </div>,
      <div class="counter-logos">
        <img alt="OutSystems logo" src={OutSystemsLogo} />
        <img alt="Astro logo" src={AstroLogo} />
      </div>,
    ];
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
