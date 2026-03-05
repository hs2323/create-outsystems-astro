import { act, fireEvent, render, screen } from "@testing-library/svelte";
import { writable } from "svelte/store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Demo from "../../../src/framework/svelte/Demo.svelte";
import DemoWrapper from "./Demo.wrapper.svelte";

describe("Demo", () => {
  const defaultProps = {
    initialCount: 5,
    showMessage: "mockFunction",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockStore: any;

  beforeEach(() => {
    mockStore = writable("Mocked Nano Value");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).mockFunction = vi.fn();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Stores = {
      svelteStore: mockStore,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the initial count", () => {
    render(Demo, { props: defaultProps });
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders slots (header and default)", () => {
    render(DemoWrapper);

    expect(screen.getByText("Test Header")).toBeInTheDocument();
    expect(screen.getByText("Test Children")).toBeInTheDocument();
  });

  it("increments count when add button is clicked", async () => {
    render(Demo, { props: defaultProps });
    const addButton = screen.getByRole("button", { name: "+" });

    await fireEvent.click(addButton);
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("decrements count when subtract button is clicked", async () => {
    render(Demo, { props: defaultProps });
    const subtractButton = screen.getByRole("button", { name: "-" });

    await fireEvent.click(subtractButton);
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("calls the show message function", async () => {
    render(Demo, { props: defaultProps });
    const sendButton = screen.getByRole("button", { name: "Send value" });

    await fireEvent.click(sendButton);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).mockFunction).toHaveBeenCalledWith(5);
  });

  it("updates the component when the nanostore value changes", async () => {
    render(Demo, { props: defaultProps });

    expect(screen.getByText(/Mocked Nano Value/i)).toBeInTheDocument();

    // Update the Svelte store
    await act(() => {
      mockStore.set("Updated Nano Value");
    });

    expect(screen.getByText(/Updated Nano Value/i)).toBeInTheDocument();
  });
});
