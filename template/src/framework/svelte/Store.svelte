<script lang="ts">
  import SvelteLogo from "../../images/svelte.png?url";
  import { framework } from "../../stores/framework";

  const setFramework = () => {
    framework.set("Svelte");
  };
</script>

<div class="card">
  <strong>Svelte Store</strong>
  <div class="card-content">
    <img alt="Svelte logo" src={SvelteLogo} height="150" />
    <div>
      <strong>Value:</strong>
      <div id="nanostore">{$framework}</div>
    </div>
    <div>
      <button class="card-btn" on:click={setFramework}>Select Svelte</button>
    </div>
  </div>
</div>
