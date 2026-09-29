import { fireEvent, waitFor, within } from "@testing-library/dom";
import stencilClient from "islands-integrations/stencil/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Demo from "../../../src/framework/stencil/Demo";
import { Scoped } from "./fixtures/Scoped";

// Renders the component through the same client entrypoint the island uses,
// so the props reach the element and the slots are projected as they are in
// the browser.
function renderComponent(
  Component: unknown,
  props: Record<string, unknown> = {},
  slots: Record<string, string> = {},
) {
  const island = document.createElement("astro-island");
  island.setAttribute("ssr", "");
  document.body.appendChild(island);
  stencilClient(island)(Component, props, slots);
  island.removeAttribute("ssr");
  return { element: island.firstElementChild as HTMLElement, island };
}

function renderDemo(
  props: Record<string, unknown> = {},
  slots: Record<string, string> = {},
) {
  const { element, island } = renderComponent(
    Demo,
    { initialCount: 5, showMessage: "mockFunction", ...props },
    slots,
  );
  return {
    element,
    island,
    // Stencil renders into the shadow root, which the global queries don't
    // reach.
    shadow: within(element.shadowRoot as unknown as HTMLElement),
  };
}

describe("Demo", () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).mockFunction = vi.fn();
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).mockFunction;
  });

  it("registers the element under the tag from @Component", () => {
    const { element } = renderDemo();
    expect(element.localName).toBe("stencil-demo");
    expect(customElements.get("stencil-demo")).toBe(Demo);
  });

  it("renders the initial count", async () => {
    const { shadow } = renderDemo();
    expect(await shadow.findByText("5")).toBeInTheDocument();
  });

  it("increments count when add button is clicked", async () => {
    const { shadow } = renderDemo();
    fireEvent.click(await shadow.findByRole("button", { name: "+" }));
    expect(await shadow.findByText("6")).toBeInTheDocument();
  });

  it("decrements count when subtract button is clicked", async () => {
    const { shadow } = renderDemo();
    fireEvent.click(await shadow.findByRole("button", { name: "-" }));
    expect(await shadow.findByText("4")).toBeInTheDocument();
  });

  it("calls the show message function with the current count", async () => {
    const { shadow } = renderDemo();
    fireEvent.click(await shadow.findByRole("button", { name: "Send value" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).mockFunction).toHaveBeenCalledWith(5);
  });

  it("projects the slot content into the element's light DOM", () => {
    const { element } = renderDemo(
      {},
      { default: "<p>Default slot</p>", header: "<h1>Header slot</h1>" },
    );
    const view = within(element);
    expect(view.getByText("Header slot").parentElement).toHaveAttribute(
      "slot",
      "header",
    );
    expect(view.getByText("Default slot").parentElement).not.toHaveAttribute(
      "slot",
    );
  });

  it("does not render without the ssr attribute", () => {
    const island = document.createElement("astro-island");
    document.body.appendChild(island);
    stencilClient(island)(Demo, { initialCount: 5 }, {});
    expect(island).toBeEmptyDOMElement();
  });

  it("ignores props changes without the ssr attribute", async () => {
    const { island, shadow } = renderDemo();
    fireEvent.click(await shadow.findByRole("button", { name: "+" }));
    expect(await shadow.findByText("6")).toBeInTheDocument();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).otherFunction = vi.fn();
    stencilClient(island)(
      Demo,
      { initialCount: 42, showMessage: "otherFunction" },
      {},
    );

    fireEvent.click(shadow.getByRole("button", { name: "Send value" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).mockFunction).toHaveBeenCalledWith(6);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).otherFunction).not.toHaveBeenCalled();
  });

  it("keeps its state when the props change", async () => {
    const { element, island, shadow } = renderDemo();
    fireEvent.click(await shadow.findByRole("button", { name: "+" }));
    expect(await shadow.findByText("6")).toBeInTheDocument();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).otherFunction = vi.fn();
    island.setAttribute("ssr", "");
    stencilClient(island)(
      Demo,
      { initialCount: 42, showMessage: "otherFunction" },
      {},
    );

    expect(island.querySelector("stencil-demo")).toBe(element);
    expect(shadow.getByText("6")).toBeInTheDocument();
    fireEvent.click(shadow.getByRole("button", { name: "Send value" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).otherFunction).toHaveBeenCalledWith(6);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).mockFunction).not.toHaveBeenCalled();
  });

  it("re-renders from a changed prop", async () => {
    const { island, shadow } = renderDemo();
    expect(await shadow.findByText("5")).toBeInTheDocument();

    island.setAttribute("ssr", "");
    stencilClient(island)(Demo, { initialCount: 42 }, {});

    expect(await shadow.findByText("42")).toBeInTheDocument();
  });
});

describe("Scoped component", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("relocates the slot content into its own slots", async () => {
    const { element } = renderComponent(
      Scoped,
      {},
      { default: "<p>Default slot</p>", header: "<h1>Header slot</h1>" },
    );
    expect(element.shadowRoot).toBeNull();

    await waitFor(() => {
      expect(
        element.querySelector("header")?.querySelector("astro-slot"),
      ).toHaveTextContent("Header slot");
    });
    expect(
      element.querySelector("main")?.querySelector("astro-slot"),
    ).toHaveTextContent("Default slot");
  });
});
