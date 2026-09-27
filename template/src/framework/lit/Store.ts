import { StoreController } from "@nanostores/lit";
import { html, LitElement, unsafeCSS } from "lit";

import LitLogo from "../../images/lit.png?url";
import { framework } from "../../stores/framework";
import styles from "../../styles/index.css?inline";

export default class Store extends LitElement {
  static override styles = unsafeCSS(styles);

  private selected = new StoreController(this, framework);

  override render() {
    return html`
      <div class="card">
        <strong>Lit Store</strong>
        <div class="card-content">
          <img alt="Lit logo" height="150" src=${LitLogo} />
          <div>
            <strong>Value:</strong>
            <div class="framework-value">${this.selected.value}</div>
          </div>
          <div>
            <button class="card-btn" @click=${() => framework.set("Lit")}>
              Select Lit
            </button>
          </div>
        </div>
      </div>
    `;
  }
}

if (typeof window !== "undefined" && !customElements.get("lit-store")) {
  customElements.define("lit-store", Store);
}
