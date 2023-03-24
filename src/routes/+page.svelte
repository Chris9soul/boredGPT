<script lang="ts">
	import type { ChatCompletionRequestMessage } from 'openai'

	import ChatMessage from '$lib/components/ChatMessage.svelte'
	import ExamplePrompt from '$lib/components/ExamplePrompt.svelte'
	import { SSE } from 'sse.js'
	import { query } from '$lib/stores'

	let answer = ''
	let loading = false
	let chatMessages: ChatCompletionRequestMessage[] = []
	let scrollToDiv: HTMLDivElement

	function scrollToBottom() {
		setTimeout(function() {
			scrollToDiv.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' })
		}, 100)
	}

	const handleSubmit = async () => {
		loading = true
		chatMessages = [...chatMessages, { role: 'user', content: $query}]

		const eventSource = new SSE('/api/chat', {
			headers: {
				'Content-Type': 'application/json'
			},
			payload: JSON.stringify({ messages: chatMessages })
		})

		$query = ''

		eventSource.addEventListener('error', handleError)

		eventSource.addEventListener('message', (e)=> {
			scrollToBottom()
			try {
				loading = false
				if ( e.data === '[DONE]' ) {
					chatMessages = [...chatMessages, { role: 'assistant', content: answer }]
					answer = ''
					return
				}

				const completionResponse = JSON.parse(e.data)
				const [{ delta }] = completionResponse.choices

				if (delta.content) {
					answer = (answer ?? '') + delta.content
				}

			} catch (err) {
				handleError(err)
			}
		})

		eventSource.stream()
		scrollToBottom()
	}

	function handleError<T>(err: T) {
		loading = false
		$query = ''
		answer = ''
		console.log(err)
	}
</script>

<div class="flex flex-col pt-4 w-full px-8 items-center gap-2">
	<div class="flex flex-col items-center text-center">
		<h1 class="text-4xl font-semibold w-full text-center mb-8">BoredGPT</h1>
		<p class="text-sm italic mb-4">ChatGPT's distant relative who is tired of all the questions</p>
		<p class="text-xs italic text-gray-400">Powered by gpt-3.5-turbo</p>
	</div>
	<div class="h-[500px] w-full bg-gray-900 rounded-md p-4 overflow-y-auto flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			{#if chatMessages.length === 0}
				<div class="flex flex-col items-center gap-3">
					<p>Examples</p>
					<ExamplePrompt text="Explain quantum computing in simple terms"/>
					<ExamplePrompt text="Got any creative ideas for a 10 year old's birthday?"/>
					<ExamplePrompt text="How do I make an HTTP request in Javascript?"/>
				</div>
			{/if}
			{#each chatMessages as message}
				<ChatMessage type={message.role} message={message.content} />
			{/each}
			{#if answer}
				<ChatMessage type="assistant" message={answer} />
			{/if}
			{#if loading}
				<ChatMessage type="assistant" message="..." />
			{/if}
		</div>
		<div class="" bind:this={scrollToDiv}/>
	</div>
	<form
		class="flex w-full rounded-md gap-4 bg-gray-900 p-4"
		on:submit|preventDefault={() => {
			handleSubmit()
		}}
	>
		<input type="text" class="input input-bordered w-full" bind:value={$query} />
		<button type="submit" class="btn btn-accent"> Send </button>
	</form>
</div>
