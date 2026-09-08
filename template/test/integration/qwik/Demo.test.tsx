/** @jsxImportSource @qwik.dev/core */
import { createDOM } from "@qwik.dev/core/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Demo from "../../../src/framework/qwik/Demo";

// Qwik renders into its own document rather than the happy-dom one, so the
// jest-dom matchers used by the other frameworks do not apply here.

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

  it("renders the initial count", async () => {
    const { render, screen } = await createDOM();
    await render(<Demo initialCount={5} showMessage="mockFunction" />);

    expect(screen.querySelector("pre")?.textContent).toBe("5");
  });

  it("increments count when add button is clicked", async () => {
    const { render, screen, userEvent } = await createDOM();
    await render(<Demo initialCount={5} showMessage="mockFunction" />);

    await userEvent(".counter-controls button:last-of-type", "click");

    expect(screen.querySelector("pre")?.textContent).toBe("6");
  });

  it("decrements count when subtract button is clicked", async () => {
    const { render, screen, userEvent } = await createDOM();
    await render(<Demo initialCount={5} showMessage="mockFunction" />);

    await userEvent(".counter-controls button:first-of-type", "click");

    expect(screen.querySelector("pre")?.textContent).toBe("4");
  });

  it("calls the show message function with the current count", async () => {
    const { render, userEvent } = await createDOM();
    await render(<Demo initialCount={5} showMessage="mockFunction" />);

    await userEvent(".card-btn", "click");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).mockFunction).toHaveBeenCalledWith(5);
  });
});
