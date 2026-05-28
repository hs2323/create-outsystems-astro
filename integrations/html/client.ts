const client_default =
  (element: HTMLElement) => {
    return (
      Component: unknown,
      props: Record<string, unknown>,
      slots: Record<string, string> = {},
      _directives: { client: string },
    ) => {
      // `slots` contains content Astro found in the DOM this call (templates or astro-slot elements).
      // If Astro found nothing (templates were removed after first read, or OutSystems injected
      // raw HTML without astro-slot wrappers), fall back to the hidden astro-slot elements we
      // appended after the previous render.
      const effectiveSlots: Record<string, string> = { ...slots };
      if (!Object.values(effectiveSlots).some(Boolean)) {
        for (const slotEl of element.querySelectorAll<HTMLElement>("astro-slot")) {
          if (slotEl.closest("astro-island")?.isSameNode(element)) {
            const name = slotEl.getAttribute("name") || "default";
            effectiveSlots[name] = slotEl.innerHTML;
          }
        }
      }

      const { default: children = "", ...rest } = effectiveSlots;

      let html: string;
      if (typeof Component === "string") {
        html = Component;
      } else if (typeof Component === "function") {
        html = (Component as (p: Record<string, unknown>) => string)({
          ...props,
          children,
          ...rest,
        });
      } else {
        html = "";
      }

      element.innerHTML = html;

      // Persist slot content as hidden <astro-slot> elements so Astro can re-read them on the
      // next hydrate() call. <template data-astro-template> elements (used when renderToStaticMarkup
      // returns empty HTML) are removed by Astro after the first read and must be replaced.
      for (const [name, content] of Object.entries(effectiveSlots)) {
        if (!content) continue;
        const slotEl = document.createElement("astro-slot");
        if (name !== "default") slotEl.setAttribute("name", name);
        slotEl.innerHTML = content;
        slotEl.style.display = "none";
        element.appendChild(slotEl);
      }

      element.querySelectorAll("script").forEach((oldScript) => {
        const newScript = document.createElement("script");
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    };
  };

export default client_default;
