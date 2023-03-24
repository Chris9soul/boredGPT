<script lang="ts">
	import type { ChatCompletionRequestMessageRoleEnum } from 'openai'
	import { fade } from 'svelte/transition'

	export let type: ChatCompletionRequestMessageRoleEnum
	export let message: string
	
</script>

<div transition:fade class="chat {type === 'user' ? 'chat-end' : 'chat-start'} justify-end">
	<div class="avatar placeholder">
		<div class="bg-neutral-focus text-neutral-content rounded-full w-10">
			<span class="text-s">{type === 'user' ? 'Me' : 'B'}</span>
		</div>
	</div>
	<div class="chat-header">
		{type === 'user' ? 'Me' : 'BoredGPT'}
	</div>
	<div class="chat-bubble">
		{message}
	</div>
</div>
