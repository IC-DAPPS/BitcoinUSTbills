<script lang="ts">
  import Card from "$lib/components/Card.svelte";
  import Form from "$lib/components/Form.svelte";
  import { anonymousIdentity } from "$lib/utils";
  import { get } from "$lib/api";
  import { onMount } from "svelte";
  import { set } from "$lib/api";

  // Card principal
  const principal = anonymousIdentity();
  // Card string
  let string = "";

  onMount(async () => {
    string = await get();
  });
</script>

<Form {set} />
<Card {principal} {string} />
