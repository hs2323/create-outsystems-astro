<script lang="ts">
  import Counter from "../../../src/framework/svelte/Counter.svelte";

  export let initialCount = 5;
  export let showMessage = "mockFn";

  (window as any)[showMessage] = vi.fn();

  (window as any).Stores = {
    svelteStore: {
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
