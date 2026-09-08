import AstroLogo from "../../images/astro.png?url";
import OutSystemsLogo from "../../images/outsystems.png?url";
import { setupStore } from "../../stores/demo";

if (typeof window !== "undefined") {
  setupStore("vanillaStore");
}

interface DemoProps {
  children?: string;
  header?: string;
  initialCount?: number;
  showMessage?: string;
}

export default function Demo({
  initialCount = 0,
  showMessage = "",
}: DemoProps): string {
  return `
    <div class="counter-title" slot="header">Vanilla JS Demo Component</div>
    <div class="vanilla-demo">
      <div class="card-grid">
        <div class="card">
          <strong>Vanilla JS counter component</strong>
          <div class="card-content">
            Internal counter controls. It keeps state within the component.
            <div class="counter-controls">
              <button class="subtract">-</button>
              <pre class="count">${initialCount}</pre>
              <button class="add">+</button>
            </div>
          </div>
          The button sends the current count value to a function in the parent
          component.
          <div class="card-content">
            <div>
              <button class="card-btn send">Send value</button>
            </div>
          </div>
        </div>
        <div class="card">
          <strong>Nano Stores</strong>
          <div class="card-content">
            <div>
              <strong>Value:</strong>
              <div class="nanostore-value"></div>
            </div>
          </div>
        </div>
      <div class="card unused">
        <strong>Slot content (not supported)</strong>
        <div class="card-content"></div>
      </div>
      </div>
      <div class="counter-logos">
        <img alt="OutSystems logo" src="${OutSystemsLogo}" />
        <img alt="Astro logo" src="${AstroLogo}" />
      </div>
      <script>
        (function () {
          const container = (document.currentScript && document.currentScript.parentElement) || document.querySelector('.vanilla-demo');
          let count = ${initialCount};
          const countEl = container.querySelector('.count');
          const addBtn = container.querySelector('.add');
          const subtractBtn = container.querySelector('.subtract');
          const sendBtn = container.querySelector('.send');
          const nanostoreEl = container.querySelector('.nanostore-value');

          addBtn.addEventListener('click', function () {
            count += 1;
            countEl.textContent = count;
          });

          subtractBtn.addEventListener('click', function () {
            count -= 1;
            countEl.textContent = count;
          });

          sendBtn.addEventListener('click', function () {
            if ('${showMessage}' && window['${showMessage}']) {
              window['${showMessage}'](count);
            }
          });

          const store = window.Stores && window.Stores['vanillaStore'];

          if (store) {
            store.subscribe(function (value) {
              nanostoreEl.textContent = value;
            });
          }
        })();
      </script>
    </div>
  `;
}
