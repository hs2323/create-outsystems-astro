<script lang="ts">
  import { vi } from "vitest";

  import Counter from "../../../src/framework/svelte/Counter.svelte";

  export let initialCount = 5;
  export let showMessage = "mockFn";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any)[showMessage] = vi.fn();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).Stores = {
    svelteStore: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subscribe: (fn: any) => {
        fn("test-store-value");
        return () => {};
      },
    },
  };
</script>

<Counter {initialCount} {showMessage}>
  <h1 slot="header">Test Header</h1>
  <div>Test Children</div>
</Counter>
