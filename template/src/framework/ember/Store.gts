import { registerDestructor } from "@ember/destroyable";
import { on } from "@ember/modifier";
import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";

import EmberLogo from "../../images/ember.png?url";
import { type CurrentSelectedFramework, framework } from "../../stores/framework";

export default class Store extends Component {
  // Nano Stores has no Ember binding, so the store value is copied into a
  // tracked field that re-renders the template when it changes.
  @tracked selectedFramework: CurrentSelectedFramework = framework.get();

  constructor(owner: unknown, args: object) {
    super(owner, args);

    const unsubscribe = framework.subscribe((value) => {
      this.selectedFramework = value;
    });
    registerDestructor(this, unsubscribe);
  }

  setFramework = () => {
    framework.set("Ember");
  };

  <template>
    <div class="card">
      <strong>Ember Store</strong>
      <div class="card-content">
        <img alt="Ember logo" height="150" src={{EmberLogo}} />
        <div>
          <strong>Value:</strong>
          <div id="nanostore">{{this.selectedFramework}}</div>
        </div>
        <div>
          <button
            class="card-btn"
            type="button"
            {{on "click" this.setFramework}}
          >
            Select Ember
          </button>
        </div>
      </div>
    </div>
  </template>
}
