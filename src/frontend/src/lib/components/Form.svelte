<script lang="ts">
  import Input from "./ui/Input.svelte";
  import Tag from "./ui/Tag.svelte";
  import IconCheck from "./ui/IconCheck.svelte";

  // Props with Svelte 5 syntax
  let {
    set,
  }: {
    set: (name: string) => Promise<void>;
  } = $props();

  // Form input
  let input = $state("");

  // Visibility
  let inputDisabled = $state(false);
  let successVisible = $state(false);

  const submit = async () => {
    inputDisabled = true;

    await set(input);
    successVisible = true;

    input = "";
    inputDisabled = false;
  };
</script>

<Input
  id="input"
  name="input"
  type="text"
  bind:value={input}
  disabled={inputDisabled}
  placeholder="Enter your name"
/>

<button data-testid="button" class="primary" onclick={submit} type="button"
  >Send</button
>

{#if successVisible}
  <Tag intent="success" testId="success">
    <IconCheck />
    Form successfully submitted!
  </Tag>
{/if}

<style>
  button.primary {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s ease;
    margin: 1rem 0;
  }

  button.primary:hover {
    background: #2563eb;
  }

  button.primary:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
</style>
