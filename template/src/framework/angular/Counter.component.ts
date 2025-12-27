import { Component, input, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import OutSystemsLogo from '../../images/outsystems.png?url';
import AstroLogo from '../../images/astro.png?url';

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="counter-title" slot="header">
        Counter
    </div>

    <div class="counter-controls">
      <button (click)="subtract()">-</button>
      <pre>{{ count() }}</pre>
      <button (click)="add()">+</button>
    </div>

    <div class="counter-message">
      <button (click)="showParentMessage()">Send value</button>
    </div>

    <div class="counter-logos">
      <img [src]="outSystemsLogo" alt="OutSystems logo" />
      <img [src]="astroLogo" alt="Astro logo" />
    </div>
  `,
})
export default class CounterComponent implements OnInit {
  initialCount = input<number>(0, { alias: 'InitialCount' });
  messageFunctionName = input<string>("",{ alias: 'ShowMessage' });

  count = signal(0);

  outSystemsLogo = OutSystemsLogo;
  astroLogo = AstroLogo;

  ngOnInit() {
    this.count.set(this.initialCount());
  }

  add() {
    this.count.update((i) => i + 1);
  }

  subtract() {
    this.count.update((i) => i - 1);
  }

  showParentMessage() {
    const fnName = this.messageFunctionName();
    
    // Safety check to ensure the function exists on window/document
    if (typeof (document as any)[fnName] === 'function') {
      (document as any)[fnName](this.count());
    }
  }
}
