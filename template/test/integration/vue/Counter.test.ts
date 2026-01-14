import { fireEvent, render, screen } from "@testing-library/vue";
import Counter from "../../../src/framework/vue/Counter.vue";

describe("Counter", () => {
  const defaultProps = {
    initialCount: 5,
    showMessage: "mockFunction",
  };

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any).mockFunction = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (document as any).mockFunction;
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
    expect((document as any).mockFunction).toHaveBeenCalledWith(5);
  });
});
