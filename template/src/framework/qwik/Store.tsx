/** @jsxImportSource @qwik.dev/core */
import { component$ } from "@qwik.dev/core";

import QwikLogo from "../../images/qwik.png?url";

export default component$(() => {
  return (
    <div class="card unused">
      <strong>Qwik Store</strong>
      <div class="card-content">
        <img alt="Qwik logo" height={150} src={QwikLogo} />
        <div>
          <strong>Qwik does not currently support Nano Stores.</strong>
        </div>
      </div>
    </div>
  );
});
