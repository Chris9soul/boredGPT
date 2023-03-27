<script lang="ts">
	import type { ChatCompletionRequestMessage } from 'openai'

	import ChatMessage from '$lib/components/ChatMessage.svelte'
	import ExamplePrompt from '$lib/components/ExamplePrompt.svelte'
	import { SSE } from 'sse.js'
	import { query } from '$lib/stores'

	let answer = ''
	let loading = false
	let error = false
	let chatMessages: ChatCompletionRequestMessage[] = []
	let messagesWindow: HTMLElement

	function scrollToBottom() {
		setTimeout(function() {
			messagesWindow.scroll({ top: messagesWindow.scrollHeight, behavior: "smooth"})
		}, 100)
	}

	const handleSubmit = async () => {
		loading = true

		if (error) {
			error = false
		} else {
			chatMessages = [...chatMessages, { role: 'user', content: $query}]
		}

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
		error = true
		$query = ''
		answer = ''
	}
</script>

<div class="flex flex-col pt-8 h-full w-full px-2 bg-gray-900 items-center gap-2 sm:px-8 ">
	<div bind:this={messagesWindow} class="h-full w-full rounded-md sm:px-4 sm:pt-4 pb-20 overflow-y-auto flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			{#if chatMessages.length === 0}
				<div class="flex flex-col items-center text-center">
					<h1 class="text-4xl font-semibold w-full text-center mb-8">BoredGPT</h1>
					<p class="text-sm italic mb-4">ChatGPT's distant relative who is tired of all the questions</p>
					<p class="text-xs italic text-gray-400">Powered by gpt-3.5-turbo</p>
				</div>
				<div class="flex flex-col items-center gap-3">
					<p>Examples</p>
					<ExamplePrompt text="Explain quantum computing in simple terms"/>
					<ExamplePrompt text="Got any creative ideas for a 10 year old's birthday?"/>
					<ExamplePrompt text="How do I make an HTTP request in Javascript?"/>
				</div>
				<div class="flex flex-col items-center gap-3 mt-4">
					<p>Capabilities</p>
					<ExamplePrompt type="info" text="Is too lazy to answer sometimes"/>
					<ExamplePrompt type="info" text="Incredibly sarcastic. May hurt your feelings"/>
					<ExamplePrompt type="info" text="Sometimes actually helpful"/>
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
			{#if error}
				<div class="flex flex-col justify-center items-center gap-2 border-solid border border-red-800 bg-red-500/10 rounded-md py-2">
					There was an error. 
					<button on:click={handleSubmit} class="py-2 px-3 flex justify-center items-center rounded-md relative text-white hover:text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
						Try again
					</button>
				</div>
			{/if}
		</div>
	</div>
	<div class="absolute bottom-0 w-full sm:p-4 p-2 bg-gradient-to-t from-gray-900 via-gray-900">
		<form
		class="flex w-full rounded-md gap-4 sm:px-8"
		on:submit|preventDefault={() => {
			handleSubmit()
		}}
		>
		<input type="text" class="input input-bordered w-full bg-gray-800" bind:value={$query} />

		<button class="p-1 w-14 flex-auto flex justify-center items-center rounded-md relative text-emerald-300 hover:text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:text-gray-500 {loading || ($query.trim() === '') ? 'cursor-not-allowed' : ''}" disabled={loading || ($query.trim() === '') ? true : false}>
			{#if loading}
				<svg style="margin: auto; background: rgba(0, 0, 0, 0); display: block;" class="h-5 w-5" height="1.25em" width="1.25em" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
					<circle cx="50" cy="50" fill="none" stroke="#ffffff" stroke-width="6" r="28" stroke-dasharray="131.94689145077132 45.982297150257104">
						<animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="2s" values="0 50 50;360 50 50" keyTimes="0;1"></animateTransform>
					</circle>
				</svg>
			{:else}
			<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 mr-1" height="1.25em" width="1.25em" xmlns="http://www.w3.org/2000/svg">
				<line x1="22" y1="2" x2="11" y2="13"></line>
				<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
			</svg>
			{/if}
		</button>
		</form>
	</div>
</div>