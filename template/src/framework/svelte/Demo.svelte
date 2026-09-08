<script lang="ts">
  import { useStore } from "@nanostores/svelte-runes";

  import AstroLogo from "../../images/astro.png?url";
  import OutSystemsLogo from "../../images/outsystems.png?url";
  import { Operation, setCounterCount } from "../../lib/setCounterCount";
  import { setupStore } from "../../stores/demo";

  interface Props {
    children?: import("svelte").Snippet;
    header?: import("svelte").Snippet;
    initialCount: number;
    showMessage: string;
  }

  let { children, header, initialCount, showMessage }: Props = $props();

  let count = $state(initialCount);

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

  const store = setupStore("svelteStore");
  const nanoStoreValue = useStore(store);
</script>

{#if header}
  {@render header()}
{/if}

<div class="card-grid">
  <div class="card">
    <strong>Svelte counter component</strong>
    <div class="card-content">
      Internal counter controls. It keeps state within the component.
      <div class="counter-controls">
        <button onclick={subtract}>-</button>
        <pre>{count}</pre>
        <button onclick={add}>+</button>
      </div>
    </div>
    The button sends the current count value to a function in the parent component.
    <div class="card-content">
      <div>
        <button class="card-btn" onclick={showParentMessage}>
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
        <div id="nanostore">{nanoStoreValue.current}</div>
      </div>
    </div>
  </div>

  <div class="card">
    <strong>Slot content</strong>
    <div class="card-content">
      <div>
        {@render children?.()}
      </div>
    </div>
  </div>
</div>

<div class="counter-logos">
  <img alt="OutSystems logo" src={OutSystemsLogo} />
  <img alt="Astro logo" src={AstroLogo} />
</div>
