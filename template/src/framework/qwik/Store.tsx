/** @jsxImportSource @qwik.dev/core */
import { component$ } from "@qwik.dev/core";

import QwikLogo from "../../images/qwik.png?url";

export default component$(() => {
  return (
    <div class="card unused">
      <strong>Qwik Store</strong>
      <div class="card-content">
        <img alt="Qwik logo" height={150} src={QwikLogo} width={146} />
        <div>
          <strong>
            Qwik does not have an official Nano Stores implementation.
          </strong>
        </div>
      </div>
    </div>
  );
});
