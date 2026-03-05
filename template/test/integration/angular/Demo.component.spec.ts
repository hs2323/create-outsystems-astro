import { fireEvent, render, screen } from "@testing-library/angular";
import { it, vi } from "vitest";
import DemoComponent from "../../../src/framework/angular/Demo.component";

describe("DemoComponent (Testing Library)", () => {
  it("should render the initial count", async () => {
    await render(DemoComponent, {
      componentInputs: { initialCount: 5 },
    });

    const countElement = screen.getByText("5");
    expect(countElement).toBeInTheDocument();
  });

  it("should increment the count when add button is clicked", async () => {
    await render(DemoComponent, {
      componentInputs: { initialCount: 5 },
    });

    const addButton = screen.getByRole("button", { name: "+" });
    await fireEvent.click(addButton);

    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("should decrement the count when add button is clicked", async () => {
    await render(DemoComponent, {
      componentInputs: { initialCount: 5 },
    });

    const addButton = screen.getByRole("button", { name: "-" });
    await fireEvent.click(addButton);

    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it('should call the showParentMessage function when "Send value" button is clicked', async () => {
    const { fixture } = await render(DemoComponent, {
      componentInputs: { initialCount: 5 },
    });

    const component = fixture.componentInstance;
    const showParentMessageSpy = vi.spyOn(component, "showParentMessage");

    const sendValueButton = screen.getByText(/send value/i);
    await fireEvent.click(sendValueButton);

    expect(showParentMessageSpy).toHaveBeenCalled();
  });
});
