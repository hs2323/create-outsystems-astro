import { fireEvent, screen } from "@testing-library/dom";
import jqueryClient from "islands-integrations/jquery/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Demo from "../../../src/framework/jquery/Demo";

// Renders the component through the same client entrypoint the island uses,
// which also provides the global `jQuery` the inline scripts run with. The
// island only renders while it has the `ssr` attribute, which the island
// runtime and the OutSystems Islands module set before each render.
function hydrate(island: HTMLElement, props: Record<string, unknown>) {
  island.setAttribute("ssr", "");
  jqueryClient(island)(Demo, props);
  island.removeAttribute("ssr");

  // happy-dom does not execute the re-created scripts, so run them here.
  island.querySelectorAll("script").forEach((script) => {
    new Function(script.textContent ?? "")();
  });
}

function renderDemo(props: Record<string, unknown> = {}) {
  const island = document.createElement("astro-island");
  document.body.appendChild(island);
  hydrate(island, { initialCount: 5, showMessage: "mockFunction", ...props });
  return island;
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

  it("renders the header with jQuery", () => {
    renderDemo();
    expect(screen.getByText("jQuery Demo Component")).toBeInTheDocument();
  });

  it("renders the initial count", () => {
    renderDemo();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("increments count when add button is clicked", () => {
    renderDemo();
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("decrements count when subtract button is clicked", () => {
    renderDemo();
    fireEvent.click(screen.getByRole("button", { name: "-" }));
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("calls the show message function with the current count", () => {
    renderDemo();
    fireEvent.click(screen.getByRole("button", { name: "Send value" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).mockFunction).toHaveBeenCalledWith(5);
  });

  it("does not render without the ssr attribute", () => {
    const island = document.createElement("astro-island");
    document.body.appendChild(island);
    jqueryClient(island)(Demo, { initialCount: 5 });
    expect(island).toBeEmptyDOMElement();
  });

  it("renders again with the new props", () => {
    const island = renderDemo();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).otherFunction = vi.fn();
    hydrate(island, { initialCount: 42, showMessage: "otherFunction" });

    expect(screen.getAllByText("jQuery Demo Component")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("43")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Send value" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).otherFunction).toHaveBeenCalledWith(43);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).mockFunction).not.toHaveBeenCalled();
  });
});
