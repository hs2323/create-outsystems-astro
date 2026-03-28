/** @jsxImportSource solid-js */
import { useStore } from "@nanostores/solid";

import SolidLogo from "../../images/solid.png?url";
import { framework } from "../../stores/framework";

export default function Store() {
  const selectedFramework = useStore(framework);

  const setFramework = () => {
    framework.set("Solid");
  };

  return (
    <div class="card">
      <strong>Solid Store</strong>
      <div class="card-content">
        <img alt="Solid logo" height={150} src={SolidLogo} />
        <div>
          <strong>Value:</strong>
          <div id="nanostore">{selectedFramework()}</div>
        </div>
        <div>
          <button class="card-btn" onClick={setFramework}>
            Select React
          </button>
        </div>
      </div>
    </div>
  );
}
