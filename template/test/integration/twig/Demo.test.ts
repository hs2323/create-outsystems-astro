import { fireEvent, screen } from "@testing-library/dom";
import Twig from "twig";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import template from "../../../src/framework/twig/Demo.twig?raw";

function renderDemo(props: Record<string, unknown> = {}) {
  document.body.innerHTML = Twig.twig({ data: template }).render(props);
  document.body.querySelectorAll("script").forEach((script) => {
    new Function(script.textContent ?? "")();
  });
}

describe("Demo", () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).mockFunction = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).mockFunction;
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
});
