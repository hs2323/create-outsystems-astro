import { fireEvent, screen } from "@testing-library/dom";
import Twig from "twig";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Demo from "../../../src/framework/twig/Demo";

function renderDemo(props: Record<string, unknown> = {}) {
  document.body.innerHTML = Twig.twig({ data: Demo() }).render(props);
  document.body.querySelectorAll("script").forEach((script) => {
    new Function(script.textContent ?? "")();
  });
}

describe("Demo", () => {
  let capturedListener: ((val: string) => void) | undefined;
  let storeValue = "Mocked Nano Value";

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).mockFunction = vi.fn();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Stores = {
      twigStore: {
        get: vi.fn(() => storeValue),
        set: vi.fn((v: string) => {
          storeValue = v;
          capturedListener?.(v);
        }),
        subscribe: vi.fn((fn: (val: string) => void) => {
          capturedListener = fn;
          fn(storeValue);
          return () => {};
        }),
      },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).mockFunction;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).Stores;
    capturedListener = undefined;
    storeValue = "Mocked Nano Value";
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
    capturedListener?.("Updated Value");
    expect(screen.getByText("Updated Value")).toBeInTheDocument();
  });
});
