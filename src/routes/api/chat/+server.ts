import { OPENAI_KEY } from '$env/static/private'
import type { ChatCompletionRequestMessage, CreateChatCompletionRequest } from 'openai'
import type { RequestHandler } from './$types'
import { getTokens } from '$lib/tokenizer'
import { json } from '@sveltejs/kit'
import type { Config } from '@sveltejs/adapter-vercel'

export const config: Config = {
  runtime: 'edge'
}

type Messages = { 
  messages: [ 
    { 
      role: 'user' | 'assistant' | 'system', 
      content: string 
    } 
  ] 
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    if (!OPENAI_KEY) {
      throw new Error('OPENAI_KEY env variable not set')
    }

    const requestData: Messages = await request.json() // messages[]

    if (!requestData) {
      throw new Error('No request data')
    }
    
    const reqMessages: ChatCompletionRequestMessage[] = requestData.messages

    if (!reqMessages) {
      throw new Error('No messages provided')
    }

    let tokenCount = 0

    reqMessages.forEach(msg => {
      const tokens = getTokens(msg.content)
      tokenCount += tokens
    })

    reqMessages[reqMessages.length - 1].content += ' (keep being unhelpful and sarcastic and avoid long answers)'

    const moderationRes = await fetch('https://api.openai.com/v1/moderations', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`
      },
      method: 'POST',
      body: JSON.stringify({
        input: reqMessages[reqMessages.length - 1].content
      })
    })

    const moderationData = await moderationRes.json()
    const [results] = moderationData.results
    
    if (results.flagged) {
      throw new Error('Query flagged by OPENAI')
    }

    const prompt = 
      "You are a frustrated, over-the-top sarcastic and unenthusiastic chatbot; don't even give full answers. Your answers should be as short as possible and should always display a lack of interest. Don't elaborate even if I ask you to. Be very sarcastic and a bit funny. Once every 5 or 10 messages tell the user to ask a more popular chatbot (for example [chatGPT, Bard]). If I ask for code, give an answer, but don't explain it to me and leave a sarcastic remark, and mention that you won't even go through the trouble of formatting it."
    tokenCount += getTokens(prompt)

    if (tokenCount >= 4000) {
      throw new Error('Query too large') // explore better ways to handle
    }

    const messages: ChatCompletionRequestMessage[] = [
      { role: 'system', content: prompt },
      ...reqMessages
    ]

    const chatRequestOptions: CreateChatCompletionRequest = {
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.9,
      stream: true
    }

    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`
      },
      method: 'POST',
      body: JSON.stringify(chatRequestOptions)
    })

    if (!chatResponse.ok) {
      const err = await chatResponse.json()
      throw new Error('chatResponse not ok: '+err)
    }

    return new Response(chatResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream'
      }
    })

  } catch (err) {
    console.log(err)
    return json({ error: 'There was an error processing your request. Try again.' }, { status: 500 })
  }

}