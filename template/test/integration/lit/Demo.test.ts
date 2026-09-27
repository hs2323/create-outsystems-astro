import { fireEvent, within } from "@testing-library/dom";
import litClient from "islands-integrations/lit/client";
import { html, LitElement } from "lit";
import { atom } from "nanostores";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Demo from "../../../src/framework/lit/Demo";

// Renders the component through the same client entrypoint the island uses,
// so the props reach the element and the slots are projected as they are in
// the browser.
function renderDemo(
  props: Record<string, unknown> = {},
  slots: Record<string, string> = {},
) {
  const island = document.createElement("astro-island");
  island.setAttribute("ssr", "");
  document.body.appendChild(island);
  litClient(island)(
    Demo,
    { initialCount: 5, showMessage: "mockFunction", ...props },
    slots,
  );
  island.removeAttribute("ssr");

  const element = island.querySelector("lit-demo") as Demo;
  return {
    element,
    island,
    // Lit renders into the shadow root, which the global queries don't reach.
    shadow: within(element.shadowRoot as unknown as HTMLElement),
  };
}

describe("Demo", () => {
  let store = atom("Mocked Nano Value");

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).mockFunction = vi.fn();

    store = atom("Mocked Nano Value");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Stores = { litStore: store };
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).mockFunction;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).Stores;
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

  it("displays the initial nanostore value", async () => {
    const { shadow } = renderDemo();
    expect(await shadow.findByText("Mocked Nano Value")).toBeInTheDocument();
  });

  it("updates the display when the nanostore value changes", async () => {
    const { shadow } = renderDemo();
    expect(await shadow.findByText("Mocked Nano Value")).toBeInTheDocument();
    store.set("Updated Value");
    expect(await shadow.findByText("Updated Value")).toBeInTheDocument();
  });

  it("does not render without the ssr attribute", () => {
    const island = document.createElement("astro-island");
    document.body.appendChild(island);
    litClient(island)(Demo, { initialCount: 5 }, {});
    expect(island).toBeEmptyDOMElement();
  });

  it("ignores props changes without the ssr attribute", async () => {
    const { island, shadow } = renderDemo();
    fireEvent.click(await shadow.findByRole("button", { name: "+" }));
    expect(await shadow.findByText("6")).toBeInTheDocument();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).otherFunction = vi.fn();
    litClient(island)(
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
    litClient(island)(
      Demo,
      { initialCount: 42, showMessage: "otherFunction" },
      {},
    );
    await element.updateComplete;

    expect(island.querySelector("lit-demo")).toBe(element);
    expect(shadow.getByText("6")).toBeInTheDocument();
    fireEvent.click(shadow.getByRole("button", { name: "Send value" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).otherFunction).toHaveBeenCalledWith(6);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).mockFunction).not.toHaveBeenCalled();
  });

  it("renders a class that was never registered", async () => {
    class Unregistered extends LitElement {
      override render() {
        return html`<p>Unregistered</p>`;
      }
    }

    const island = document.createElement("astro-island");
    island.setAttribute("ssr", "");
    document.body.appendChild(island);
    litClient(island)(Unregistered, {}, {});

    const element = island.firstElementChild as Unregistered;
    expect(element).toBeInstanceOf(Unregistered);
    expect(element.localName).toMatch(/^islands-lit-\d+$/);
    await element.updateComplete;
    expect(
      within(element.shadowRoot as unknown as HTMLElement).getByText(
        "Unregistered",
      ),
    ).toBeInTheDocument();
  });
});
