import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from 'eventsource-parser'

export type ChatGPTAgent = 'user' | 'system' | 'assistant'

export interface ChatGPTMessage {
  role: ChatGPTAgent
  content: string
}

export interface OpenAIStreamPayload {
  model: string
  messages: ChatGPTMessage[]
  temperature?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  max_tokens?: number
  stream: boolean
  stop?: string[]
  user?: string
  n?: number
  functions?: any[]
  function_call?: string
}

export async function OpenAIStream(payload: OpenAIStreamPayload) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  let counter = 0

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
  }

  if (process.env.OPENAI_API_ORG) {
    requestHeaders['OpenAI-Organization'] = process.env.OPENAI_API_ORG
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: requestHeaders,
    method: 'POST',
    body: JSON.stringify(payload),
  })

  // get status code
  console.log('res.status', res.status)
  if (res.status !== 200) {
    console.log('res.statusText', res.statusText)
    throw new Error('OpenAI API Error')
  }
  
  let result = await res.json()
  console.log('result', result)
  return result?.choices[0]

  const stream = new ReadableStream({
    async start(controller) {
      // callback
      function onParse(event: ParsedEvent | ReconnectInterval) {
        if (event.type === 'event') {
          const data = event.data
          // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
          if (data === '[DONE]') {
            console.log('DONE')
            controller.close()
            return
          }
          try {
            const json = JSON.parse(data)
            console.log('json', json.choices[0])
            const text = json.choices[0].delta?.content || json.choices[0].delta?.function_call?.arguments || ''
            if (counter < 2 && (text.match(/\n/) || []).length) {
              // this is a prefix character (i.e., "\n\n"), do nothing
              return
            }
            const queue = encoder.encode(text)
            controller.enqueue(queue)
            counter++
          } catch (e) {
            // maybe parse error
            controller.error(e)
          }
        }
      }

      // stream response (SSE) from OpenAI may be fragmented into multiple chunks
      // this ensures we properly read chunks and invoke an event for each SSE event stream
      const parser = createParser(onParse)
      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk))
      }
    },
  })

  return stream
}


// const payload: OpenAIStreamPayload = {
//   model: 'gpt-3.5-turbo-0613',
//   messages: messages,
//   temperature: process.env.AI_TEMP ? parseFloat(process.env.AI_TEMP) : 0.7,
//   max_tokens: process.env.AI_MAX_TOKENS
//     ? parseInt(process.env.AI_MAX_TOKENS)
//     : 100,
//   top_p: 1,
//   frequency_penalty: 0,
//   presence_penalty: 0,
//   stream: false,
//   user: body?.user,
//   n: 1,
//   functions: [
//     {
//         "name": "get_current_weather",
//         "description": "Get the current weather in a given location",
//         "parameters": {
//             "type": "object",
//             "properties": {
//                 "location": {
//                     "type": "string",
//                     "description": "The city and state, e.g. San Francisco, CA",
//                 },
//                 "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
//             },
//             "required": ["location"],
//         },
//     }
// ],
//   function_call: "get_current_weather",
// }