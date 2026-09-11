import type { Environment } from "vitest/runtime";

import { builtinEnvironments } from "vitest/runtime";

const happyDom = builtinEnvironments["happy-dom"];

// happy-dom, but with the runtime's own `Event` constructor left in place.
//
// Qwik's scheduler builds a MessageChannel to queue macro tasks and closes both
// ports when it tears the channel down. Under Deno that channel comes from the
// node:worker_threads polyfill, which dispatches its "close" event with
// whatever `Event` constructor is on globalThis. happy-dom replaces that
// global, so Deno rejects its own event and the whole Vitest worker dies with
// "Cannot set properties of undefined (setting 'target')", taking the Qwik
// tests with it. Qwik renders into the document `createDOM()` creates for
// itself, so nothing here needs happy-dom's Event.
const environment: Environment = {
  name: "happy-dom-deno",
  async setup(global, options) {
    const NativeEvent = global.Event;
    const { teardown } = await happyDom.setup(global, options);

    global.Event = NativeEvent;

    return { teardown };
  },
  viteEnvironment: "client",
};

export default environment;
