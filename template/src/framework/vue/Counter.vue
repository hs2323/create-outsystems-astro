<script setup lang="ts">
import { ref } from "vue";
import { useStore } from "@nanostores/vue";

import AstroLogo from "../../images/astro.png?url";
import OutSystemsLogo from "../../images/outsystems.png?url";
import { Operation, setCounterCount } from "../../lib/setCounterCount";

const props = defineProps<{
  initialCount: number;
  showMessage: string;
}>();

const count = ref(props.initialCount);

const add = () => {
  count.value = setCounterCount(count.value, Operation.Add);
};

const subtract = () => {
  count.value = setCounterCount(count.value, Operation.Subtract);
};

const showParentMessage = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any)[props.showMessage](count.value);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nanoStoreValue = useStore((window as any).Stores["reactStore"]);
</script>

<template>
  <slot name="header" />

  <div class="card-grid">
    <div class="card">
      Internal counter controls. It keeps state within the component.
      <div class="card-content">
        <div class="counter-controls">
          <button @click="subtract">-</button>
          <pre>{{ count }}</pre>
          <button @click="add">+</button>
        </div>
      </div>
    </div>

    <div class="card">
      The button sends the current count value to a function in the parent
      component.
      <div class="card-content">
        <div>
          <button class="card-btn" @click="showParentMessage">
            Send value
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      Slot content coming in to the component
      <div class="card-content">
        <div>
          <slot />
        </div>
      </div>
    </div>

    <div class="card">
      Nano Store content
      <div class="card-content">
        <div>
          <strong>Nano Store value:</strong>
          <div id="nanostore">{{ nanoStoreValue }}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="counter-logos">
    <img alt="OutSystems logo" :src="OutSystemsLogo" />
    <img alt="Astro logo" :src="AstroLogo" />
  </div>
</template>
