import AstroLogo from "../../images/astro.png?url";
import OutSystemsLogo from "../../images/outsystems.png?url";
import { setupStore } from "../../stores/demo";

if (typeof window !== "undefined") {
  setupStore("jqueryStore");
}

interface DemoProps {
  initialCount?: number;
  showMessage?: string;
}

export default function Demo({
  initialCount = 0,
  showMessage = "",
}: DemoProps): string {
  return `
    <div class="jquery-demo">
      <script>
        (function ($) {
          const $container = document.currentScript
            ? $(document.currentScript).parent()
            : $(".jquery-demo");
          const showMessage = ${JSON.stringify(showMessage)};
          let count = ${Number(initialCount)};

          $container.append(
            '<div class="counter-title">jQuery Demo Component</div>' +
            '<div class="card-grid">' +
              '<div class="card">' +
                '<strong>jQuery counter component</strong>' +
                '<div class="card-content">' +
                  'Internal counter controls. It keeps state within the component.' +
                  '<div class="counter-controls">' +
                    '<button class="subtract">-</button>' +
                    '<pre class="count"></pre>' +
                    '<button class="add">+</button>' +
                  '</div>' +
                '</div>' +
                'The button sends the current count value to a function in the parent component.' +
                '<div class="card-content">' +
                  '<div><button class="card-btn send">Send value</button></div>' +
                '</div>' +
              '</div>' +
              '<div class="card">' +
                '<strong>Nano Stores</strong>' +
                '<div class="card-content">' +
                  '<div><strong>Value:</strong><div class="nanostore-value"></div></div>' +
                '</div>' +
              '</div>' +
              '<div class="card unused">' +
                '<strong>Slot content (not supported)</strong>' +
                '<div class="card-content"></div>' +
              '</div>' +
            '</div>' +
            '<div class="counter-logos"></div>'
          );

          $container.find(".counter-logos").append(
            $("<img>", { alt: "OutSystems logo", src: ${JSON.stringify(OutSystemsLogo)} }),
            $("<img>", { alt: "Astro logo", src: ${JSON.stringify(AstroLogo)} })
          );

          const $count = $container.find(".count").text(count);

          $container.on("click", ".add", function () {
            $count.text(++count);
          });

          $container.on("click", ".subtract", function () {
            $count.text(--count);
          });

          $container.on("click", ".send", function () {
            if (typeof window[showMessage] === "function") {
              window[showMessage](count);
            }
          });

          const store = window.Stores && window.Stores["jqueryStore"];

          if (store) {
            const $value = $container.find(".nanostore-value");
            const unsubscribe = store.subscribe(function (value) {
              $value.text(value);
            });
            // The island triggers this before it renders again.
            $container.closest("astro-island").one("islands:unmount", unsubscribe);
          }
        })(jQuery);
      </script>
    </div>
  `;
}
