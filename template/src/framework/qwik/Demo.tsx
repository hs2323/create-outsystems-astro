/** @jsxImportSource @qwik.dev/core */
import { component$, Slot, useSignal } from "@qwik.dev/core";

import AstroLogo from "../../images/astro.png?url";
import OutSystemsLogo from "../../images/outsystems.png?url";
import { Operation, setCounterCount } from "../../lib/setCounterCount";

interface DemoProps {
  initialCount: number;
  showMessage: string;
}

export default component$<DemoProps>(({ initialCount, showMessage }) => {
  const count = useSignal(initialCount);

  return (
    <>
      <Slot name="header" />
      <div class="card-grid">
        <div class="card">
          <strong>Qwik counter component</strong>
          <div class="card-content">
            Internal counter controls. It keeps state within the component.
            <div class="counter-controls">
              <button
                onClick$={() => {
                  count.value = setCounterCount(
                    count.value,
                    Operation.Subtract,
                  );
                }}
              >
                -
              </button>
              <pre>{count.value}</pre>
              <button
                onClick$={() => {
                  count.value = setCounterCount(count.value, Operation.Add);
                }}
              >
                +
              </button>
            </div>
          </div>
          The button sends the current count value to a function in the parent
          component.
          <div class="card-content">
            <div>
              <button
                class="card-btn"
                onClick$={() => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const messageFunc = (window as any)[showMessage];

                  if (typeof messageFunc === "function") {
                    messageFunc(count.value);
                  }
                }}
              >
                Send value
              </button>
            </div>
          </div>
        </div>
        <div class="card unused">
          <strong>Nano Stores (not supported)</strong>
          <div class="card-content"></div>
        </div>
        <div class="card">
          <strong>Slot content</strong>
          <div class="card-content">
            <div>
              <Slot />
            </div>
          </div>
        </div>
      </div>
      <div class="counter-logos">
        <img alt="OutSystems logo" src={OutSystemsLogo} />
        <img alt="Astro logo" src={AstroLogo} />
      </div>
    </>
  );
});
