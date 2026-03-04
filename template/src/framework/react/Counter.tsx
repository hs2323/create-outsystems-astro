/** @jsxImportSource react */
import { useStore } from "@nanostores/react";
import { useState } from "react";

import AstroLogo from "../../images/astro.png?url";
import OutSystemsLogo from "../../images/outsystems.png?url";
import { Operation, setCounterCount } from "../../lib/setCounterCount";

export default function Counter({
  children,
  header,
  initialCount,
  showMessage,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  initialCount: number;
  showMessage: string;
}) {
  const [count, setCount] = useState(initialCount);

  const add = () => setCount((i) => setCounterCount(i, Operation.Add));

  const subtract = () =>
    setCount((i) => setCounterCount(i, Operation.Subtract));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const showParentMessage = () => (window as any)[showMessage](count);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nanoStoreValue = useStore((window as any).Stores["reactStore"]);

  return (
    <>
      {header}
      <div className="card-grid">
        <div className="card">
          <strong>React component</strong>
          <div className="card-content">
            Internal counter controls. It keeps state within the component.
            <div className="counter-controls">
              <button onClick={subtract}>-</button>
              <pre>{count}</pre>
              <button onClick={add}>+</button>
            </div>
          </div>
          The button sends the current count value to a function in the parent
          component.
          <div className="card-content">
            <div>
              <button className="card-btn" onClick={showParentMessage}>
                Send value
              </button>
            </div>
          </div>
        </div>
        <div className="card">
          <strong>Nano Stores</strong>
          <div className="card-content">
            <div>
              <strong>Value:</strong>
              <div id="nanostore">{nanoStoreValue}</div>
            </div>
          </div>
        </div>
        <div className="card">
          <strong>Slot content</strong>
          <div className="card-content">
            <div>{children}</div>
          </div>
        </div>
      </div>
      <div className="counter-logos">
        <img alt="OutSystems logo" src={OutSystemsLogo} />
        <img alt="Astro logo" src={AstroLogo} />
      </div>
    </>
  );
}
