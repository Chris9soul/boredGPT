<script lang="ts">
	import type { ChatCompletionRequestMessageRoleEnum } from 'openai'

	export let type: ChatCompletionRequestMessageRoleEnum
	export let message: string
	
</script>

<style>
.chat-header {
	align-self: center;
}
.avatar {
	align-self: end;
}

</style>

<div class="chat {type === 'user' ? 'chat-end' : 'chat-start'}">
	<div class="avatar placeholder row-span-2">
		<div class="bg-neutral-focus text-neutral-content rounded-full w-10">
			<span class="text-s">{type === 'user' ? 'ME' : 'B'}</span>
		</div>
	</div>
	<div class="chat-header text-neutral-300">
		{type === 'user' ? 'Me' : 'BoredGPT'}
	</div>
	<div class="chat-bubble text-red-50">
		{message}
	</div>
</div>
