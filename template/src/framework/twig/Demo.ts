import AstroLogo from "../../images/astro.png?url";
import OutSystemsLogo from "../../images/outsystems.png?url";

export default function Demo(): string {
  return `
    <div class="counter-title">Twig Demo Component</div>
    <div class="twig-demo">
      <div class="card-grid">
        <div class="card">
          <strong>Twig counter component</strong>
          <div class="card-content">
            Internal counter controls. It keeps state within the component.
            <div class="counter-controls">
              <button class="subtract">-</button>
              <pre class="count">{{ initialCount|default(0) }}</pre>
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
          const container = (document.currentScript && document.currentScript.parentElement) || document.querySelector('.twig-demo');
          let count = {{ initialCount|default(0) }};
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
            if ('{{ showMessage|default('') }}' && window['{{ showMessage|default('') }}']) {
              window['{{ showMessage|default('') }}'](count);
            }
          });

          if (!window.Stores) window.Stores = {};
          if (!window.Stores['twigStore']) {
            let _value = 'Test Value';
            const _subs = [];
            window.Stores['twigStore'] = {
              get: function () { return _value; },
              set: function (v) { _value = v; _subs.forEach(function (fn) { fn(v); }); },
              subscribe: function (fn) {
                fn(_value);
                _subs.push(fn);
                return function () { _subs.splice(_subs.indexOf(fn), 1); };
              },
            };
          }

          const store = window.Stores['twigStore'];
          nanostoreEl.textContent = store.get();
          store.subscribe(function (value) {
            nanostoreEl.textContent = value;
          });
        })();
      </script>
    </div>
  `;
}
