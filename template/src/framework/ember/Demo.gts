import { registerDestructor } from "@ember/destroyable";
import { on } from "@ember/modifier";
import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";

import AstroLogo from "../../images/astro.png?url";
import OutSystemsLogo from "../../images/outsystems.png?url";
import { Operation, setCounterCount } from "../../lib/setCounterCount";
import { setupStore } from "../../stores/demo";

interface DemoSignature {
  Args: {
    // Astro passes its props and slots through `@props` and `@slots`.
    props: {
      initialCount: number;
      showMessage: string;
    };
    slots: {
      default?: string;
      header?: string;
    };
  };
}

export default class Demo extends Component<DemoSignature> {
  @tracked count = this.args.props.initialCount;
  @tracked nanoStoreValue: string;

  constructor(owner: unknown, args: DemoSignature["Args"]) {
    super(owner, args);

    const store = setupStore("emberStore");
    this.nanoStoreValue = store.get();

    const unsubscribe = store.subscribe((value: string) => {
      this.nanoStoreValue = value;
    });
    registerDestructor(this, unsubscribe);
  }

  add = () => {
    this.count = setCounterCount(this.count, Operation.Add);
  };

  subtract = () => {
    this.count = setCounterCount(this.count, Operation.Subtract);
  };

  showParentMessage = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (window as any)[this.args.props.showMessage];
    if (typeof handler === "function") handler(this.count);
  };

  <template>
    {{! Astro slots are HTML strings, so they are inserted unescaped. }}
    {{{@slots.header}}}
    <div class="card-grid">
      <div class="card">
        <strong>Ember counter component</strong>
        <div class="card-content">
          Internal counter controls. It keeps state within the component.
          <div class="counter-controls">
            <button type="button" {{on "click" this.subtract}}>-</button>
            <pre>{{this.count}}</pre>
            <button type="button" {{on "click" this.add}}>+</button>
          </div>
        </div>
        The button sends the current count value to a function in the parent
        component.
        <div class="card-content">
          <div>
            <button
              class="card-btn"
              type="button"
              {{on "click" this.showParentMessage}}
            >
              Send value
            </button>
          </div>
        </div>
      </div>
      <div class="card">
        <strong>Nano Stores</strong>
        <div class="card-content">
          <div>
            <strong>Value:</strong>
            <div id="nanostore">{{this.nanoStoreValue}}</div>
          </div>
        </div>
      </div>
      <div class="card">
        <strong>Slot content</strong>
        <div class="card-content">
          <div>{{{@slots.default}}}</div>
        </div>
      </div>
    </div>
    <div class="counter-logos">
      <img alt="OutSystems logo" src={{OutSystemsLogo}} />
      <img alt="Astro logo" src={{AstroLogo}} />
    </div>
  </template>
}
