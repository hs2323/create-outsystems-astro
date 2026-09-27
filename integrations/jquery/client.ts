import BundledJQuery from "jquery";

declare global {
  interface Window {
    jQuery?: JQueryStatic;
  }
}

/**
 * Returns the page's jQuery, exposing the bundled one if there is none.
 *
 * The component's inline scripts are classic scripts and cannot import, so
 * they use the global `jQuery`. A jQuery the page already loaded (the
 * OutSystems app, a plugin bundle) is reused, so plugins registered on it are
 * available to the scripts.
 */
function getJQuery(): JQueryStatic {
  if (!window.jQuery) window.jQuery = BundledJQuery;
  return window.jQuery;
}

const client_default =
  (element: HTMLElement) =>
  (Component: unknown, props: Record<string, unknown>) => {
    // The island runtime and the OutSystems Islands module both set `ssr` when
    // they want the island (re-)rendered. Without it there is nothing to do.
    if (!element.hasAttribute("ssr")) return;

    let html: string;
    if (typeof Component === "string") {
      html = Component;
    } else if (typeof Component === "function") {
      html = (Component as (p: Record<string, unknown>) => string)({
        ...props,
      });
    } else {
      html = "";
    }

    // Tear down the previous render before replacing it: `islands:unmount`
    // lets its scripts undo what jQuery cannot, such as a Nano Store
    // subscription, and `empty` removes the rendered elements with their
    // handlers and data.
    const $ = getJQuery();
    $(element).triggerHandler("islands:unmount");
    $(element).off("islands:unmount").empty();

    element.innerHTML = html;

    element.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  };

export default client_default;
