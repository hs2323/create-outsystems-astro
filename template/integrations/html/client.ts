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
  };

export default client_default;
