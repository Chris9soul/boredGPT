<script lang="ts">
  import { query } from '$lib/stores'


	export let text: string

	function quickPrompt() {
		$query = text
	}
</script>

<button
	on:click={quickPrompt}
	class="p-2 bg-gray-800 rounded-md w-full text-center hover:bg-gray-700 transition-colors"
	>"<span>{text}</span>" →</button>
