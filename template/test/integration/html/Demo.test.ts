import { fireEvent, screen } from "@testing-library/dom";
import { atom } from "nanostores";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Demo from "../../../src/framework/html/Demo";

function renderDemo(props: Parameters<typeof Demo>[0] = {}) {
  document.body.innerHTML = Demo(props);
  document.body.querySelectorAll("script").forEach((script) => {
    new Function(script.textContent ?? "")();
  });
}

describe("Demo", () => {
  let store = atom("Mocked Nano Value");

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).mockFunction = vi.fn();

    store = atom("Mocked Nano Value");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Stores = { htmlStore: store };
  });

  afterEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).mockFunction;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).Stores;
  });

  it("renders the initial count", () => {
    renderDemo({ initialCount: 5 });
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("increments count when add button is clicked", () => {
    renderDemo({ initialCount: 5 });
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("decrements count when subtract button is clicked", () => {
    renderDemo({ initialCount: 5 });
    fireEvent.click(screen.getByRole("button", { name: "-" }));
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("calls the show message function with the current count", () => {
    renderDemo({ initialCount: 5, showMessage: "mockFunction" });
    fireEvent.click(screen.getByRole("button", { name: "Send value" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).mockFunction).toHaveBeenCalledWith(5);
  });

  it("displays the initial nanostore value", () => {
    renderDemo({});
    expect(screen.getByText("Mocked Nano Value")).toBeInTheDocument();
  });

  it("updates the display when the nanostore value changes", () => {
    renderDemo({});
    expect(screen.getByText("Mocked Nano Value")).toBeInTheDocument();
    store.set("Updated Value");
    expect(screen.getByText("Updated Value")).toBeInTheDocument();
  });
});
