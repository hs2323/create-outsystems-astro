import { CommonModule } from "@angular/common";
import { Component, input, type OnInit, signal } from "@angular/core";

import AstroLogo from "../../images/astro.png?url";
import OutSystemsLogo from "../../images/outsystems.png?url";
import { Operation, setCounterCount } from "../../lib/setCounterCount";

@Component({
  imports: [CommonModule],
  selector: "app-counter",
  standalone: true,
  template: `
    <div class="counter-title" slot="header">Counter</div>
    <div class="card-grid">
      <div class="card">
        Internal counter controls. It keeps state within the component.
        <div class="card-content">
          <div class="counter-controls">
            <button (click)="subtract()">-</button>
            <pre>{{ count() }}</pre>
            <button (click)="add()">+</button>
          </div>
        </div>
      </div>
      <div class="card">
        The button sends the current count value to a function in the parent
        component.
        <div class="card-content">
          <div>
            <button class="card-btn" (click)="showParentMessage()">
              Send value
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="counter-logos">
      <img [src]="outSystemsLogo" alt="OutSystems logo" />
      <img [src]="astroLogo" alt="Astro logo" />
    </div>
  `,
})
export default class CounterComponent implements OnInit {
  astroLogo = AstroLogo;
  count = signal(0);

  initialCount = input<number>(0, { alias: "initialCount" });

  messageFunctionName = input<string>("", { alias: "showMessage" });
  outSystemsLogo = OutSystemsLogo;

  add() {
    this.count.update((i) => setCounterCount(i, Operation.Add));
  }

  ngOnInit() {
    this.count.set(this.initialCount());
  }

  showParentMessage() {
    const fnName = this.messageFunctionName();

    // Safety check to ensure the function exists on window.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (window as any)[fnName] === "function") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any)[fnName](this.count());
    }
  }

  subtract() {
    this.count.update((i) => setCounterCount(i, Operation.Subtract));
  }
}
