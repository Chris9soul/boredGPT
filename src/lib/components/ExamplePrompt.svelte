<script lang="ts">
  import { query } from '$lib/stores'

	export let type = "button"
	export let text: string

	function quickPrompt() {
		$query = text
		window.scrollTo(0, document.body.scrollHeight)
	}
</script>

{#if type==="button"}
	<button
		on:click={quickPrompt}
		class="p-2 bg-gray-800 rounded-md w-full text-center hover:bg-gray-700 transition-colors"
	>
		"<span>{text}</span>" →
	</button>
{:else}
	<div
		class="p-2 bg-gray-800 rounded-md w-full text-center"
	>
		{text}
	</div>
{/if}
