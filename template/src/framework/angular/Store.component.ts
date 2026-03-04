import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

import AngularLogo from "../../images/angular.png?url";

@Component({
  imports: [CommonModule],
  selector: "app-counter",
  standalone: true,
  template: `
    <div class="card unused">
      <strong>Angular Store</strong>
      <div class="card-content">
        <img [src]="angularLogo" alt="Angular logo" height="150" />
        <div>
          <strong>Angular 21 does not currently support Nano Stores.</strong>
        </div>
      </div>
    </div>
  `,
})
export default class StoreComponent {
  angularLogo = AngularLogo;
}
