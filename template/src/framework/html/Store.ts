import HTMLLogo from "../../images/html.png?url";
import { framework } from "../../stores/framework";

if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(window as any).Stores) (window as any).Stores = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).Stores["framework"] = framework;
}

export default function Store(): string {
  return `
    <div class="card">
      <strong>HTML Store</strong>
      <div class="card-content">
        <img alt="HTML logo" height="150" src="${HTMLLogo}" />
        <div>
          <strong>Value:</strong>
          <div class="framework-value"></div>
        </div>
        <div>
          <button class="card-btn select-btn">Select HTML</button>
        </div>
      </div>
      <script>
        (function () {
          const container = (document.currentScript && document.currentScript.parentElement)
            || document.querySelector('.html-store');
          const valueEl = container.querySelector('.framework-value');
          const btn = container.querySelector('.select-btn');

          const store = window.Stores && window.Stores['framework'];

          if (store) {
            store.subscribe(function (value) {
              valueEl.textContent = value;
            });
          }

          btn.addEventListener('click', function () {
            if (store) store.set('HTML');
          });
        })();
      </script>
    </div>
  `;
}
