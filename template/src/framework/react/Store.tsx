/** @jsxImportSource react */
import { useStore } from "@nanostores/react";

import ReactLogo from "../../images/react.png?url";
import { framework } from "../../stores/framework";

export default function Store() {
  const selectedFramework = useStore(framework);

  const setFramework = () => {
    framework.set("React");
  };

  return (
    <div className="card">
      <strong>React Store</strong>
      <div className="card-content">
        <img alt="React logo" height={150} src={ReactLogo} />
        <div>
          <strong>Value:</strong>
          <div id="nanostore">{selectedFramework}</div>
        </div>
        <div>
          <button className="card-btn" onClick={setFramework}>
            Select React
          </button>
        </div>
      </div>
    </div>
  );
}
