<script lang="ts">
  import Card from "./ui/Card.svelte";

  let {
    principal = "",
    string = "",
  }: {
    principal?: string;
    string?: string;
  } = $props();
</script>

<Card>
  {#snippet start()}
    <h3 data-testid="principal">{principal}</h3>
  {/snippet}

  <p data-testid="string">{string}</p>
</Card>
