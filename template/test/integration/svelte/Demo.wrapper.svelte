<script lang="ts">
  import { vi } from "vitest";
  import Demo from "../../../src/framework/svelte/Demo.svelte";

  interface Props {
    initialCount?: number;
    showMessage?: string;
  }

  let { initialCount = 5, showMessage = "mockFn" }: Props = $props();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any)[showMessage] = vi.fn();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).Stores = {
    svelteStore: {
      get: () => "test-store-value",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      listen: (fn: any) => {
        fn("test-store-value");
        return () => {};
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subscribe: (fn: any) => {
        fn("test-store-value");
        return () => {};
      },
    },
  };
</script>

<Demo {initialCount} {showMessage}>
  {#snippet header()}
    <h1>Test Header</h1>
  {/snippet}

  <div>Test Children</div>
</Demo>
