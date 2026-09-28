/** @jsxImportSource @stencil/core */
import { Component, State } from "@stencil/core";

import StencilLogo from "../../images/stencil.png?url";
import { framework } from "../../stores/framework";
import styles from "../../styles/index.css?inline";

@Component({ shadow: true, styles, tag: "stencil-store" })
export default class Store {
  @State() selected = "";

  private unsubscribe?: () => void;

  connectedCallback() {
    this.unsubscribe = framework.subscribe((value) => (this.selected = value));
  }

  disconnectedCallback() {
    this.unsubscribe?.();
  }

  render() {
    return (
      <div class="card">
        <strong>Stencil Store</strong>
        <div class="card-content">
          <img alt="Stencil logo" height="150" src={StencilLogo} />
          <div>
            <strong>Value:</strong>
            <div class="framework-value">{this.selected}</div>
          </div>
          <div>
            <button class="card-btn" onClick={() => framework.set("Stencil")}>
              Select Stencil
            </button>
          </div>
        </div>
      </div>
    );
  }
}
