/** @jsxImportSource solid-js */
import { useStore } from "@nanostores/solid";
import { createSignal, type JSX } from "solid-js";

import AstroLogo from "../../images/astro.png?url";
import OutSystemsLogo from "../../images/outsystems.png?url";
import { Operation, setCounterCount } from "../../lib/setCounterCount";
import { setupStore } from "../../stores/demo";

interface DemoProps {
  children?: JSX.Element;
  header?: JSX.Element;
  initialCount: number;
  showMessage: string;
}

export default function Demo(props: DemoProps) {
  const [count, setCount] = createSignal(props.initialCount);

  const store = setupStore("solidStore");
  const nanoStoreValue = useStore(store);

  const add = () => setCount((i) => setCounterCount(i, Operation.Add));
  const subtract = () =>
    setCount((i) => setCounterCount(i, Operation.Subtract));

  const showParentMessage = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messageFunc = (window as any)[props.showMessage];
    if (typeof messageFunc === "function") {
      messageFunc(count());
    }
  };

  return (
    <>
      {props.header}

      <div class="card-grid">
        <div class="card">
          <strong>Solid counter component</strong>
          <div class="card-content">
            Internal counter controls. It keeps state within the component.
            <div class="counter-controls">
              <button onClick={subtract}>-</button>
              <pre>{count()}</pre>
              <button onClick={add}>+</button>
            </div>
          </div>
          The button sends the current count value to a function in the parent
          component.
          <div class="card-content">
            <div>
              <button class="card-btn" onClick={showParentMessage}>
                Send value
              </button>
            </div>
          </div>
        </div>

        <div class="card">
          <strong>Nano Stores</strong>
          <div class="card-content">
            <div>
              <strong>Value:</strong>
              <div id="nanostore">{nanoStoreValue()}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <strong>Slot content</strong>
          <div class="card-content">
            <div>{props.children}</div>
          </div>
        </div>
      </div>

      <div class="counter-logos">
        <img alt="OutSystems logo" src={OutSystemsLogo} />
        <img alt="Astro logo" src={AstroLogo} />
      </div>
    </>
  );
}
