/** @jsxImportSource preact */
import { act, fireEvent, render, screen } from "@testing-library/preact";
import { it, vi } from "vitest";

import Demo from "../../../src/framework/preact/Demo";

describe("Demo", () => {
  const defaultProps = {
    children: <div>Test Children</div>,
    header: <h1>Test Header</h1>,
    initialCount: 5,
    showMessage: "mockFunction",
  };

  let capturedListener: ((val: string) => void) | undefined;
  let storeValue = "Mocked Nano Value";

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).mockFunction = vi.fn();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).Stores = {
      preactStore: {
        get: vi.fn(() => storeValue),
        listen: vi.fn((callback) => {
          capturedListener = callback;
          callback(storeValue);
          return () => {};
        }),
      },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
    capturedListener = undefined;
    storeValue = "Mocked Nano Value";
  });

  it("renders the initial count", () => {
    render(<Demo {...defaultProps} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders header", () => {
    render(<Demo {...defaultProps} />);
    expect(screen.getByText("Test Header")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(<Demo {...defaultProps} />);
    expect(screen.getByText("Test Children")).toBeInTheDocument();
  });

  it("increments count when add button is clicked", () => {
    render(<Demo {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("decrements count when subtract button is clicked", () => {
    render(<Demo {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "-" }));
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("calls the show message function", () => {
    render(<Demo {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: "Send value" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).mockFunction).toHaveBeenCalledWith(5);
  });

  it("updates the component when the nanostore value changes", async () => {
    render(<Demo {...defaultProps} />);
    expect(screen.getByText(/Mocked Nano Value/i)).toBeInTheDocument();
    await act(async () => {
      storeValue = "Updated Nano Value";
      capturedListener?.("Updated Nano Value");
    });
    expect(await screen.findByText(/Updated Nano Value/i)).toBeInTheDocument();
  });
});
