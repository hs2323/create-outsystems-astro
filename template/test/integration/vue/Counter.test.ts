import { fireEvent, render, screen, waitFor } from "@testing-library/vue";
import { it, vi } from "vitest";

import Counter from "../../../src/framework/vue/Counter.vue";

describe("Counter", () => {
  const defaultProps = {
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
      vueStore: {
        get: vi.fn(() => storeValue),
        subscribe: vi.fn((callback) => {
          capturedListener = callback;
          callback(storeValue);
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
    render(Counter, {
      props: defaultProps,
      slots: {
        default: "<div><p>Test Children</p></div>",
        header: "<div>Test Header</div>",
      },
    });
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders header slot", () => {
    render(Counter, {
      props: defaultProps,
      slots: {
        default: "<div><p>Test Children</p></div>",
        header: "<div>Test Header</div>",
      },
    });
    expect(screen.getByText("Test Header")).toBeInTheDocument();
  });

  it("renders default slot content", () => {
    render(Counter, {
      props: defaultProps,
      slots: {
        default: "<div><p>Test Children</p></div>",
        header: "<div>Test Header</div>",
      },
    });
    expect(screen.getByText("Test Children")).toBeInTheDocument();
  });

  it("increments count when add button is clicked", async () => {
    render(Counter, {
      props: defaultProps,
      slots: {
        default: "<div><p>Test Children</p></div>",
        header: "<div>Test Header</div>",
      },
    });

    await fireEvent.click(screen.getByRole("button", { name: "+" }));
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("decrements count when subtract button is clicked", async () => {
    render(Counter, {
      props: defaultProps,
      slots: {
        default: "<div><p>Test Children</p></div>",
        header: "<div>Test Header</div>",
      },
    });

    await fireEvent.click(screen.getByRole("button", { name: "-" }));
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("calls the show message function with the current count", async () => {
    render(Counter, {
      props: defaultProps,
      slots: {
        default: "<div><p>Test Children</p></div>",
        header: "<div>Test Header</div>",
      },
    });

    await fireEvent.click(screen.getByRole("button", { name: "Send value" }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((window as any).mockFunction).toHaveBeenCalledWith(5);
  });

  it("updates the component when the nanostore value changes", async () => {
    render(Counter, {
      props: defaultProps,
      slots: {
        default: "<div><p>Test Children</p></div>",
        header: "<div>Test Header</div>",
      },
    });

    expect(screen.getByText(/Mocked Nano Value/i)).toBeInTheDocument();
    await waitFor(async () => {
      storeValue = "Updated Nano Value";
      capturedListener?.("Updated Nano Value");
    });
    expect(await screen.findByText(/Updated Nano Value/i)).toBeInTheDocument();
  });
});
