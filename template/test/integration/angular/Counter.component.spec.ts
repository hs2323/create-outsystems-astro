import { fireEvent, render, screen } from "@testing-library/angular";
import { vi } from "vitest";
import CounterComponent from "../../../src/framework/angular/Counter.component";

describe("CounterComponent (Testing Library)", () => {
  it("should render the initial count", async () => {
    await render(CounterComponent, {
      componentInputs: { initialCount: 5 },
    });

    const countElement = screen.getByText("5");
    expect(countElement).toBeInTheDocument();
  });

  it("should increment the count when add button is clicked", async () => {
    await render(CounterComponent, {
      componentInputs: { initialCount: 5 },
    });

    const addButton = screen.getByRole("button", { name: '+' });
    await fireEvent.click(addButton);

    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("should decrement the count when add button is clicked", async () => {
    await render(CounterComponent, {
      componentInputs: { initialCount: 5 },
    });

    const addButton = screen.getByRole("button", { name: '-' });
    await fireEvent.click(addButton);

    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it('should call the showParentMessage function when "Send value" button is clicked', async () => {
    const { fixture } = await render(CounterComponent, {
      componentInputs: { initialCount: 5 },
    });

    const component = fixture.componentInstance;
    const showParentMessageSpy = vi.spyOn(component, "showParentMessage");

    const sendValueButton = screen.getByText(/send value/i);
    await fireEvent.click(sendValueButton);

    expect(showParentMessageSpy).toHaveBeenCalled();
  });
});
