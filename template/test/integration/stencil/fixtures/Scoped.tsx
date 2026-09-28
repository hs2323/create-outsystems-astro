/** @jsxImportSource @stencil/core */
import { Component } from "@stencil/core";

// A component without a shadow root, whose slots Stencil relocates itself.
@Component({ scoped: true, tag: "stencil-scoped" })
export class Scoped {
  render() {
    return [
      <header>
        <slot name="header" />
      </header>,
      <main>
        <slot />
      </main>,
    ];
  }
}
