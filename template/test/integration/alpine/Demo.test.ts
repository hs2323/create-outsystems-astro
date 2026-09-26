import { fireEvent, screen } from "@testing-library/dom";
import alpineClient from "islands-integrations/alpine/client";
import { atom } from "nanostores";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Demo from "../../../src/framework/alpine/Demo";

// Renders the component through the same client entrypoint the island uses,
// so the props reach Alpine's scope and the slots are projected as they are
// in the browser.
function renderDemo(
  props: Record<string, unknown> = {},
  slots: Record<string, string> = {},
) {
  const island = document.createElement("astro-island");
  island.setAttribute("ssr", "");
  document.body.appendChild(island);
  alpineClient(island)(
    Demo,
    { initialCount: 5, showMessage: "mockFunction", ...props },
    slots,
  );
  island.removeAttribute("ssr");
  return island;
}

describe("Demo", () => {
  let store = atom("Mocked Nano Value");

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).mockFunction = vi.fn();

    store = atom("Mocked Nano Value");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Stores = { alpineStore: store };
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
    renderDemo();
    expect(await screen.findByText("5")).toBeInTheDocument();
  });

  it("increments count when add button is clicked", async () => {
    renderDemo();
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(await screen.findByText("6")).toBeInTheDocument();
  });

  it("decrements count when subtract button is clicked", async () => {
    renderDemo();
    fireEvent.click(screen.getByRole("button", { name: "-" }));
    expect(await screen.findByText("4")).toBeInTheDocument();
  });

  it("calls the show message function with the current count", () => {
    renderDemo();
    fireEvent.click(screen.getByRole("button", { name: "Send value" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).mockFunction).toHaveBeenCalledWith(5);
  });

  it("renders the slot content", () => {
    renderDemo(
      {},
      { default: "<p>Default slot</p>", header: "<h1>Header slot</h1>" },
    );
    expect(screen.getByText("Header slot")).toBeInTheDocument();
    expect(screen.getByText("Default slot")).toBeInTheDocument();
  });

  it("displays the initial nanostore value", async () => {
    renderDemo();
    expect(await screen.findByText("Mocked Nano Value")).toBeInTheDocument();
  });

  it("updates the display when the nanostore value changes", async () => {
    renderDemo();
    expect(await screen.findByText("Mocked Nano Value")).toBeInTheDocument();
    store.set("Updated Value");
    expect(await screen.findByText("Updated Value")).toBeInTheDocument();
  });

  it("does not render without the ssr attribute", () => {
    const island = document.createElement("astro-island");
    document.body.appendChild(island);
    alpineClient(island)(Demo, { initialCount: 5 }, {});
    expect(island).toBeEmptyDOMElement();
  });

  it("ignores props changes without the ssr attribute", async () => {
    const island = renderDemo();
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(await screen.findByText("6")).toBeInTheDocument();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).otherFunction = vi.fn();
    alpineClient(island)(
      Demo,
      { initialCount: 42, showMessage: "otherFunction" },
      {},
    );

    fireEvent.click(screen.getByRole("button", { name: "Send value" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).mockFunction).toHaveBeenCalledWith(6);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).otherFunction).not.toHaveBeenCalled();
  });

  it("keeps its state when the props change", async () => {
    const island = renderDemo();
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(await screen.findByText("6")).toBeInTheDocument();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).otherFunction = vi.fn();
    island.setAttribute("ssr", "");
    alpineClient(island)(
      Demo,
      { initialCount: 42, showMessage: "otherFunction" },
      {},
    );

    expect(screen.getByText("6")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Send value" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).otherFunction).toHaveBeenCalledWith(6);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).mockFunction).not.toHaveBeenCalled();
  });
});
