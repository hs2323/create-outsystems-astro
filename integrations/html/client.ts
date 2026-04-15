const client_default =
  (element: HTMLElement) =>
  (
    Component: unknown,
    props: Record<string, unknown>,
    { default: children = "", ...slots }: Record<string, string> = {},
    { client }: { client: string },
  ) => {
    if (client !== "only" && !element.hasAttribute("ssr")) return;

    let html: string;
    if (typeof Component === "string") {
      html = Component;
    } else if (typeof Component === "function") {
      html = (Component as (p: Record<string, unknown>) => string)({
        ...props,
        children,
        ...slots,
      });
    } else {
      html = "";
    }

    element.innerHTML = html;

    // innerHTML does not execute <script> tags — re-create each one so it runs
    element.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  };

export default client_default;
