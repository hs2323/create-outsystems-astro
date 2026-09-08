<script lang="ts">
  import { useStore } from '@nanostores/svelte-runes';

  import SvelteLogo from "../../images/svelte.png?url";
  import { framework } from "../../stores/framework";

  const currentFramework = useStore(framework);

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
      <div id="nanostore">{currentFramework.current}</div>
    </div>
    <div>
      <button class="card-btn" onclick={setFramework}>Select Svelte</button>
    </div>
  </div>
</div>