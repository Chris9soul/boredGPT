<script lang="ts">
	import type { ChatCompletionRequestMessage } from 'openai'

	import ChatMessage from '$lib/components/ChatMessage.svelte'
	import ExamplePrompt from '$lib/components/ExamplePrompt.svelte'
	import { SSE } from 'sse.js'
	import { query } from '$lib/stores'

	let answer = ''
	let loading = false
	let chatMessages: ChatCompletionRequestMessage[] = []
	let messagesWindow: HTMLElement

	function scrollToBottom() {
		setTimeout(function() {
			messagesWindow.scroll({ top: messagesWindow.scrollHeight, behavior: "smooth"})
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

<div class="flex flex-col pt-8 w-full px-2 items-center gap-2 sm:px-8 ">
	<div class="flex flex-col items-center text-center">
		<h1 class="text-4xl font-semibold w-full text-center mb-8">BoredGPT</h1>
		<p class="text-sm italic mb-4">ChatGPT's distant relative who is tired of all the questions</p>
		<p class="text-xs italic text-gray-400">Powered by gpt-3.5-turbo</p>
	</div>
	<div bind:this={messagesWindow} class="h-[500px] w-full bg-gray-900 rounded-md sm:p-4 p-2 overflow-y-auto flex flex-col gap-4">
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
				<ChatMessage type="assistant" typing={true} message=""/>
			{/if}
		</div>
	</div>
	<form
	class="flex w-full rounded-md gap-4 bg-gray-900 p-4"
	on:submit|preventDefault={() => {
		handleSubmit()
	}}
	>
	<input type="text" class="input input-bordered w-full bg-gray-800" bind:value={$query} />
	<!-- <button type="submit" class="btn btn-accent"> Send </button> -->
	<button class="p-1 w-14 flex-auto flex justify-center items-center rounded-md text-emerald-300 hover:text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
		<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 mr-1" height="1.25em" width="1.25em" xmlns="http://www.w3.org/2000/svg">
			<line x1="22" y1="2" x2="11" y2="13"></line>
			<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
		</svg>
	</button>
	</form>
</div>