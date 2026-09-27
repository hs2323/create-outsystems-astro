import JQueryLogo from "../../images/jquery.png?url";
import { framework } from "../../stores/framework";

if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(window as any).Stores) (window as any).Stores = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).Stores["framework"] = framework;
}

export default function Store(): string {
  return `
    <div class="card jquery-store">
      <script>
        (function ($) {
          const $container = document.currentScript
            ? $(document.currentScript).parent()
            : $(".jquery-store");

          $container.append(
            '<strong>jQuery Store</strong>' +
            '<div class="card-content">' +
              '<img alt="jQuery logo" height="150" src=${JSON.stringify(JQueryLogo)} />' +
              '<div><strong>Value:</strong><div class="framework-value"></div></div>' +
              '<div><button class="card-btn select-btn">Select jQuery</button></div>' +
            '</div>'
          );

          const store = window.Stores && window.Stores["framework"];

          if (store) {
            const $value = $container.find(".framework-value");
            const unsubscribe = store.subscribe(function (value) {
              $value.text(value);
            });
            $container.closest("astro-island").one("islands:unmount", unsubscribe);

            $container.on("click", ".select-btn", function () {
              store.set("jQuery");
            });
          }
        })(jQuery);
      </script>
    </div>
  `;
}
