<script setup lang="ts">
import { ref } from 'vue';

import OutSystemsLogo from '../../images/outsystems.png?url';
import AstroLogo from '../../images/astro.png?url';

const props = defineProps<{
  InitialCount: number;
  ShowMessage: string;
}>();

const count = ref(props.InitialCount);

const add = () => {
  count.value++;
};

const subtract = () => {
  count.value--;
};

const showParentMessage = () => {
  // Same behavior as document[ShowMessage](count) in React
  (document as any)[props.ShowMessage]?.(count.value);
};
</script>

<template>
  <div>
    <div class="counter-title">Counter</div>

    <div class="counter-controls">
      <button @click="subtract">-</button>
      <pre>{{ count }}</pre>
      <button @click="add">+</button>
    </div>

    <div class="counter-message">
      <button @click="showParentMessage">Send value</button>
    </div>

    <div class="counter-logos">
      <img :src="OutSystemsLogo" alt="OutSystems logo" />
      <img :src="AstroLogo" alt="Astro logo" />
    </div>
  </div>
</template>