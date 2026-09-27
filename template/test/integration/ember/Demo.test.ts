import { fireEvent, within } from "@testing-library/dom";
import emberClient from "ember-astro/client.js";
import { atom } from "nanostores";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Demo from "../../../src/framework/ember/Demo.gts";

const islands: HTMLElement[] = [];

// Renders the component through the same client entrypoint the island uses,
// so the props and slots reach it as `@props` and `@slots` as they do in the
// browser.
async function renderDemo(
  props: Record<string, unknown> = {},
  slots: Record<string, string> = {},
) {
  const island = document.createElement("astro-island");
  island.setAttribute("ssr", "");
  document.body.appendChild(island);
  islands.push(island);
  await emberClient(island)(
    Demo,
    { initialCount: 5, showMessage: "mockFunction", ...props },
    slots,
  );

  return { island, view: within(island) };
}

describe("Demo", () => {
  let store = atom("Mocked Nano Value");

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).mockFunction = vi.fn();

    store = atom("Mocked Nano Value");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Stores = { emberStore: store };
  });

  afterEach(() => {
    // Astro fires `astro:unmount` when an island is removed; ember-astro
    // destroys the component on it.
    for (const island of islands.splice(0)) {
      island.dispatchEvent(new Event("astro:unmount"));
    }
    document.body.innerHTML = "";
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).mockFunction;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).Stores;
  });

  it("renders the initial count", async () => {
    const { view } = await renderDemo();
    expect(await view.findByText("5")).toBeInTheDocument();
  });

  it("increments count when add button is clicked", async () => {
    const { view } = await renderDemo();
    fireEvent.click(await view.findByRole("button", { name: "+" }));
    expect(await view.findByText("6")).toBeInTheDocument();
  });

  it("decrements count when subtract button is clicked", async () => {
    const { view } = await renderDemo();
    fireEvent.click(await view.findByRole("button", { name: "-" }));
    expect(await view.findByText("4")).toBeInTheDocument();
  });

  it("calls the show message function with the current count", async () => {
    const { view } = await renderDemo();
    fireEvent.click(await view.findByRole("button", { name: "Send value" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).mockFunction).toHaveBeenCalledWith(5);
  });

  it("renders the slot content", async () => {
    const { view } = await renderDemo(
      {},
      { default: "<p>Default slot</p>", header: "<h1>Header slot</h1>" },
    );
    expect(
      await view.findByRole("heading", { name: "Header slot" }),
    ).toBeInTheDocument();
    expect(view.getByText("Default slot").tagName).toBe("P");
  });

  it("displays the initial nanostore value", async () => {
    const { view } = await renderDemo();
    expect(await view.findByText("Mocked Nano Value")).toBeInTheDocument();
  });

  it("updates the display when the nanostore value changes", async () => {
    const { view } = await renderDemo();
    expect(await view.findByText("Mocked Nano Value")).toBeInTheDocument();
    store.set("Updated Value");
    expect(await view.findByText("Updated Value")).toBeInTheDocument();
  });

  it("unsubscribes from the nanostore when the island unmounts", async () => {
    const { island, view } = await renderDemo();
    expect(await view.findByText("Mocked Nano Value")).toBeInTheDocument();
    expect(store.lc).toBe(1);

    island.dispatchEvent(new Event("astro:unmount"));

    // Ember runs destructors asynchronously.
    await vi.waitFor(() => expect(store.lc).toBe(0));
  });

  it("does not render without the ssr attribute", async () => {
    const island = document.createElement("astro-island");
    document.body.appendChild(island);
    await emberClient(island)(Demo, { initialCount: 5 }, {});
    expect(island).toBeEmptyDOMElement();
  });

  it("keeps its first props when the props change", async () => {
    const { island, view } = await renderDemo();
    fireEvent.click(await view.findByRole("button", { name: "+" }));
    expect(await view.findByText("6")).toBeInTheDocument();

    // ember-astro renders the component once and does not pass new props
    // to it, so a props update from the Islands module has no effect.
    vi.spyOn(console, "log").mockImplementation(() => {});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).otherFunction = vi.fn();
    await emberClient(island)(
      Demo,
      { initialCount: 42, showMessage: "otherFunction" },
      {},
    );

    expect(view.getByText("6")).toBeInTheDocument();
    fireEvent.click(view.getByRole("button", { name: "Send value" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).mockFunction).toHaveBeenCalledWith(6);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).otherFunction).not.toHaveBeenCalled();
  });
});
