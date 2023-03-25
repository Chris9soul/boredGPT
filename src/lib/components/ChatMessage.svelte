<script lang="ts">
	import type { ChatCompletionRequestMessageRoleEnum } from 'openai'

	export let type: ChatCompletionRequestMessageRoleEnum
	export let message: string
	export let typing = false
	
</script>


<div class="chat {type === 'user' ? 'chat-end' : 'chat-start'}">
	<div class="avatar placeholder row-span-2 sm:flex hidden">
		<div class="bg-neutral-focus text-neutral-content rounded-full w-10">
			<span class="text-s">{type === 'user' ? 'ME' : 'B'}</span>
		</div>
	</div>
	<div class="chat-header text-neutral-300 mb-1">
		{type === 'user' ? 'Me' : 'BoredGPT'}
	</div>
	<div class="chat-bubble bg-slate-800 text-red-50 flex items-center justify-center">
		{#if !typing}
			{message}
		{:else}
			<div class="dot-flashing"></div>
		{/if}
	</div>
</div>


<style>
	.chat-header {
		align-self: center;
	}
	.avatar {
		align-self: end;
	}
	
		/* Loading animation CSS */
	.dot-flashing {
		position: relative;
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.25);
		animation: dot-flashing 1s infinite linear alternate;
		animation-delay: 0.5s;
	}
	.dot-flashing::before, .dot-flashing::after {
		content: "";
		display: inline-block;
		position: absolute;
		top: 0;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.25);
		animation: dot-flashing 1s infinite alternate;
	}
	.dot-flashing::before {
		left: -200%;
		animation-delay: 0s;
	}
	.dot-flashing::after {
		left: 200%;
		animation-delay: 1s;
	}
	
	@keyframes dot-flashing {
		0% {
			background-color: white;
		}
		50%, 100% {
			background-color: rgba(255, 255, 255, 0.25);
		}
	}
	
	</style>