<script setup lang="ts">
import { useStore } from "@nanostores/vue";

import VueLogo from "../../images/vue.png?url";
import { framework } from "../../stores/framework";

const selectedFramework = useStore(framework);

const setFramework = () => {
  framework.set("Vue");
};
</script>

<template>
  <div class="card">
    <strong>Vue Store</strong>
    <div class="card-content">
      <img alt="Vue logo" :src="VueLogo" height="150" />
      <div>
        <strong>Value:</strong>
        <div id="nanostore">{{ selectedFramework }}</div>
      </div>
      <div>
        <button class="card-btn" @click="setFramework">Select Vue</button>
      </div>
    </div>
  </div>
</template>
