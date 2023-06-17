import { useEffect, useRef, useState } from 'react'
import { useCookies } from 'react-cookie'
import { Button } from './Button'
import { ChatLine, LoadingChatLine, type ChatGPTMessage } from './ChatLine'

const COOKIE_NAME = 'nextjs-example-ai-chat-gpt3'


export type BeliefType = 'christian' | 'islam' | 'mormon' | 'hinduism' | 'confucianism' | 'all_beliefs'


// default first message to display in UI (not necessary to define the prompt)
export const initialMessages: Record<BeliefType, ChatGPTMessage[]> = {
  christian: [
    {
      role: 'assistant',
      content: "Hi! I'm an AI Bible Scholar. I'm able to answer any questions you have that might be answered in the Bible. Feel free to describe a current situation you're in, reference a Bible verse, or ask me a question.",
    },
  ],
  islam: [
    {
      role: 'assistant',
      content: "Hi! I'm an AI Quran Scholar. I'm able to answer any questions you have that might be answered in the Quran. Feel free to describe a current situation you're in, reference a Quran verse, or ask me a question.",
    },
  ],
  mormon: [
    {
      role: 'assistant',
      content: "Hi! I'm an AI Book of Mormon Scholar. I'm able to answer any questions you have that might be answered in the Book of Mormon. Feel free to describe a current situation you're in, reference a Book of Mormon verse, or ask me a question.",
    },
  ],
  hinduism: [
    {
      role: 'assistant',
      content: "Hi! I'm an AI Bhagavad Gita Scholar. I'm able to answer any questions you have that might be answered in the Bhagavad Gita. Feel free to describe a current situation you're in, reference a Bhagavad Gita verse, or ask me a question.",
    },
  ],
  confucianism: [
    {
      role: 'assistant',
      content: "Hi! I'm an AI Confucianism Scholar. I'm able to answer any questions you have that might be answered in the Analects (more books coming soon). Feel free to describe a current situation you're in, reference a Analects verse, or ask me a question.",
    },
  ],
  all_beliefs: [
    {
      role: 'assistant',
      content: "Hi! I'm an AI Religion Scholar. I'm able to answer any questions you have that might be answered across all major religious books, mainly the Bible, Quran, Book of Mormon, Bhagavad Gita, and Analects. Feel free to describe a current situation you're in, reference a verse, or ask me a question.",
    }
  ]
}

const InputMessage = ({ input, setInput, sendMessage }: any) => (
  <div className="mt-6 flex clear-both">
    <input
      type="text"
      aria-label="chat input"
      required
      className="min-w-0 flex-auto appearance-none rounded-md border border-zinc-900/10 bg-white px-3 py-[calc(theme(spacing.2)-1px)] shadow-md shadow-zinc-800/5 placeholder:text-zinc-400 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 sm:text-sm"
      value={input}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          sendMessage(input)
          setInput('')
        }
      }}
      onChange={(e) => {
        setInput(e.target.value)
      }}
    />
    <Button
      type="submit"
      className="ml-4 flex-none"
      onClick={() => {
        sendMessage(input)
        setInput('')
      }}
    >
      Say
    </Button>
  </div>
)




export function Chat({ beliefType }: { beliefType: BeliefType }) {
  const [messages, setMessages] = useState<ChatGPTMessage[]>(initialMessages[beliefType])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [cookie, setCookie] = useCookies([COOKIE_NAME])

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  useEffect(() => {
    if (!cookie[COOKIE_NAME]) {
      // generate a semi random short id
      const randomId = Math.random().toString(36).substring(7)
      setCookie(COOKIE_NAME, randomId)
    }
  }, [cookie, setCookie])

  // send message to API /api/chat endpoint
  const sendMessage = async (message: string) => {
    setLoading(true)
    const newMessages = [
      ...messages,
      { role: 'user', content: message } as ChatGPTMessage,
    ]
    setMessages(newMessages)
    // const last10messages = newMessages.slice(-10) // remember last 10 messages

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: newMessages,
        user: cookie[COOKIE_NAME],
        belief: beliefType,
      }),
    })

    console.log('Edge function returned.')

    if (!response.ok) {
      throw new Error(response.statusText)
    }

    const data: any = await response.json()
    if (!data) {
      throw new Error('No data received.')
    }

    setMessages([
      ...data,
    ])

    setLoading(false)
  }

  if (!messages) {
    return <div>loading...</div>
  }
  return (
    <div className="rounded-2xl border-zinc-100  lg:border lg:p-6">
      <span className="mx-auto flex flex-grow text-red-400 clear-both mb-3 -mt-1 text-sm">
        We&apos;re currently experiencing high traffic. Please be patient as we fix the issue. Will be back up soon!
      </span>
      <span className="mx-auto flex flex-grow text-gray-400 clear-both mb-5 -mt-1 text-sm">
        Disclaimer: This is a beta version of Scholar AI. The answers provided by the AI are not guaranteed to be accurate. Please consult a religious leader for any serious questions.
        All languages are supported, but the AI is trained on English.
        No personal information is stored, all chats are anonymous and deleted as soon as the chat is over.
      </span>
      {messages.map(({ content, role }, index) => (
        <ChatLine key={index} role={role} content={content} />
      ))}

      {loading && <LoadingChatLine />}

      {messages.length < 2 && (
        <span className="mx-auto flex flex-grow text-gray-600 clear-both">
          Type a message to start the conversation
        </span>
      )}
      <InputMessage
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
      />
      <div ref={messagesEndRef} />
    </div>
  )
}
