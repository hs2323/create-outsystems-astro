/** @jsxImportSource @stencil/core */
import { Component } from "@stencil/core";

import StencilLogo from "../../images/stencil.png?url";
import styles from "../../styles/index.css?inline";

@Component({ shadow: true, styles, tag: "stencil-store" })
export default class Store {
  render() {
    return (
      <div class="card unused">
        <strong>Stencil Store</strong>
        <div class="card-content">
          <img alt="Stencil logo" height="150" src={StencilLogo} />
          <div>
            <strong>
              Stencil does not have an official Nano Stores implementation.
            </strong>
          </div>
        </div>
      </div>
    );
  }
}
