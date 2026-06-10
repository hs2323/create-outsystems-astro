import Twig from "twig";

const client_default =
  (element: HTMLElement) =>
  (
    Component: unknown,
    props: Record<string, unknown>,
    { client }: { client: string },
  ) => {
    if (client !== "only" && !element.hasAttribute("ssr")) return;

    let template: string;
    if (typeof Component === "string") {
      template = Component;
    } else if (typeof Component === "function") {
      template = (Component as (p: Record<string, unknown>) => string)({
        ...props,
      });
    } else {
      template = "";
    }

    const html = Twig.twig({ data: template }).render({ ...props });

    element.innerHTML = html;

    element.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  };

export default client_default;
