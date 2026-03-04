<script lang="ts">
  import AstroLogo from "../../images/astro.png?url";
  import OutSystemsLogo from "../../images/outsystems.png?url";
  import { Operation, setCounterCount } from "../../lib/setCounterCount";

  export let initialCount: number;
  export let showMessage: string;

  let count = initialCount;

  const add = () => {
    count = setCounterCount(count, Operation.Add);
  };

  const subtract = () => {
    count = setCounterCount(count, Operation.Subtract);
  };

  const showParentMessage = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[showMessage](count);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nanoStoreValue = (window as any).Stores["svelteStore"];
</script>

<slot name="header" />

<div class="card-grid">
  <div class="card">
    <strong>Svelte component</strong>
    <div class="card-content">
      Internal counter controls. It keeps state within the component.
      <div class="counter-controls">
        <button on:click={subtract}>-</button>
        <pre>{count}</pre>
        <button on:click={add}>+</button>
      </div>
    </div>
    The button sends the current count value to a function in the parent component.
    <div class="card-content">
      <div>
        <button class="card-btn" on:click={showParentMessage}>
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
        <div id="nanostore">{$nanoStoreValue}</div>
      </div>
    </div>
  </div>

  <div class="card">
    <strong>Slot content</strong>
    <div class="card-content">
      <div>
        <slot />
      </div>
    </div>
  </div>
</div>

<div class="counter-logos">
  <img alt="OutSystems logo" src={OutSystemsLogo} />
  <img alt="Astro logo" src={AstroLogo} />
</div>
