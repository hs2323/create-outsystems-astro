/** @jsxImportSource react */
import { useStore } from "@nanostores/preact";

import PreactLogo from "../../images/preact.png?url";
import { framework } from "../../stores/framework";

export default function Store() {
  const selectedFramework = useStore(framework);

  const setFramework = () => {
    framework.set("Preact");
  };

  return (
    <div className="card">
      <strong>Preact Store</strong>
      <div className="card-content">
        <img alt="Preact logo" height={150} src={PreactLogo} />
        <div>
          <strong>Value:</strong>
          <div id="nanostore">{selectedFramework}</div>
        </div>
        <div>
          <button className="card-btn" onClick={setFramework}>
            Select Preact
          </button>
        </div>
      </div>
    </div>
  );
}
