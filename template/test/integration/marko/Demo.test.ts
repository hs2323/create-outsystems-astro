import { fireEvent, render, screen } from "@marko/testing-library";
import markoClient from "islands-integrations/marko/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Demo from "../../../src/framework/marko/Demo.marko";
import Parent from "./fixtures/Parent.marko";

const defaultInput = {
  initialCount: 5,
  showMessage: "mockFunction",
};

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).mockFunction = vi.fn();
});

afterEach(() => {
  vi.clearAllMocks();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (window as any).mockFunction;
});

// Marko Testing Library mounts the template and destroys it after each test.
describe("Demo", () => {
  it("renders the initial count", async () => {
    await render(Demo, defaultInput);
    expect(await screen.findByText("5")).toBeInTheDocument();
  });

  it("increments count when add button is clicked", async () => {
    await render(Demo, defaultInput);
    await fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("decrements count when subtract button is clicked", async () => {
    await render(Demo, defaultInput);
    await fireEvent.click(screen.getByRole("button", { name: "-" }));
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("calls the show message function with the current count", async () => {
    await render(Demo, defaultInput);
    await fireEvent.click(screen.getByRole("button", { name: "Send value" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).mockFunction).toHaveBeenCalledWith(5);
  });

  it("keeps its state when the input changes", async () => {
    const { rerender } = await render(Demo, defaultInput);
    await fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("6")).toBeInTheDocument();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).otherFunction = vi.fn();
    await rerender({ ...defaultInput, showMessage: "otherFunction" });

    expect(screen.getByText("6")).toBeInTheDocument();
    await fireEvent.click(screen.getByRole("button", { name: "Send value" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).otherFunction).toHaveBeenCalledWith(6);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).mockFunction).not.toHaveBeenCalled();
  });

  it("re-renders from a changed initial count", async () => {
    const { rerender } = await render(Demo, defaultInput);
    expect(screen.getByText("5")).toBeInTheDocument();

    await rerender({ ...defaultInput, initialCount: 42 });

    expect(await screen.findByText("42")).toBeInTheDocument();
  });
});

describe("Nested components", () => {
  it("renders a child template imported by the component", async () => {
    const { container } = await render(Parent, { label: "Child label" });
    expect(screen.getByText("Child label")).toBeInTheDocument();

    expect(container.querySelector(".parent > .child")).not.toBeNull();
  });
});

// These check how the island renderer mounts and updates the template, so they
// go through its client entrypoint rather than Marko Testing Library.
describe("Island renderer", () => {
  const islands: HTMLElement[] = [];

  function renderIsland(props: Record<string, unknown> = {}) {
    const island = document.createElement("astro-island");
    island.setAttribute("ssr", "");
    document.body.appendChild(island);
    islands.push(island);
    markoClient(island)(Demo, {
      initialCount: 5,
      showMessage: "mockFunction",
      ...props,
    });
    island.removeAttribute("ssr");
    return island;
  }

  /** Re-renders the island the way the OutSystems Islands module does. */
  function updateProps(island: HTMLElement, props: Record<string, unknown>) {
    island.setAttribute("ssr", "");
    markoClient(island)(Demo, props);
    island.removeAttribute("ssr");
  }

  afterEach(() => {
    // Astro fires `astro:unmount` when an island is removed; the renderer
    // destroys the template instance on it.
    for (const island of islands.splice(0)) {
      island.dispatchEvent(new Event("astro:unmount"));
    }
    document.body.innerHTML = "";
  });

  it("does not pass the Astro slots to the template", () => {
    const island = renderIsland();
    expect(
      screen.getByText("Slot content (not supported)"),
    ).toBeInTheDocument();
     
    expect(island.querySelector("astro-slot")).toBeNull();
  });

  it("does not render without the ssr attribute", () => {
    const island = document.createElement("astro-island");
    document.body.appendChild(island);
    markoClient(island)(Demo, { initialCount: 5 });
    expect(island).toBeEmptyDOMElement();
  });

  it("ignores props changes without the ssr attribute", async () => {
    const island = renderIsland();
    await fireEvent.click(screen.getByRole("button", { name: "+" }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).otherFunction = vi.fn();
    markoClient(island)(Demo, {
      initialCount: 42,
      showMessage: "otherFunction",
    });

    await fireEvent.click(screen.getByRole("button", { name: "Send value" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).mockFunction).toHaveBeenCalledWith(6);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).otherFunction).not.toHaveBeenCalled();
  });

  it("updates the same instance when the props change", async () => {
    const island = renderIsland();
    await fireEvent.click(screen.getByRole("button", { name: "+" }));
    const button = screen.getByRole("button", { name: "Send value" });

    updateProps(island, { initialCount: 42, showMessage: "mockFunction" });

    expect(screen.getByRole("button", { name: "Send value" })).toBe(button);
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("destroys the instance when the island is unmounted", () => {
    const island = renderIsland();
    expect(screen.getByText("5")).toBeInTheDocument();

    island.dispatchEvent(new Event("astro:unmount"));

    expect(island).toBeEmptyDOMElement();
  });
});
