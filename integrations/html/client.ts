const client_default =
  (element: HTMLElement) =>
  (
    Component: unknown,
    props: Record<string, unknown>,
    { client }: { client: string },
  ) => {
    if (client !== "only" && !element.hasAttribute("ssr")) return;

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

    element.innerHTML = html;

    element.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  };

export default client_default;
