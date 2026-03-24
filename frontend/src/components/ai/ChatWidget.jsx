import { useEffect, useRef, useState } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const DEFAULT_MESSAGES = [
  {
    role: 'assistant',
    content:
      'Hi! Ask me for restaurant recommendations, cuisines, date-night ideas, or where to eat tonight.',
  },
]

export default function ChatWidget() {
  const { user } = useAuth()

  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState(DEFAULT_MESSAGES)

  const messagesEndRef = useRef(null)
  const lastUserIdRef = useRef(user?.id ?? null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    const currentUserId = user?.id ?? null

    if (lastUserIdRef.current !== currentUserId) {
      setMessages(DEFAULT_MESSAGES)
      setMessage('')
      setLoading(false)
      setOpen(false)
      lastUserIdRef.current = currentUserId
    }

    if (!user) {
      setMessages(DEFAULT_MESSAGES)
      setMessage('')
      setLoading(false)
    }
  }, [user])

  const sendMessage = async () => {
    const trimmed = message.trim()
    if (!trimmed || loading) return

    const nextMessages = [...messages, { role: 'user', content: trimmed }]
    setMessages(nextMessages)
    setMessage('')
    setLoading(true)

    try {
      const historyForApi = nextMessages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({ role: m.role, content: m.content }))

      const res = await api.post('/ai-assistant/chat', {
        message: trimmed,
        conversation_history: historyForApi.slice(-8),
      })

      let assistantText = res.data.reply || 'Sorry, I could not generate a response.'

      if (Array.isArray(res.data.recommendations) && res.data.recommendations.length > 0) {
        const picks = res.data.recommendations
          .slice(0, 3)
          .map((r) => `${r.name}${r.city ? ` (${r.city})` : ''}`)
          .join(', ')

        assistantText += `\n\nTop picks: ${picks}`
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err.response?.data?.detail ||
            'The assistant is unavailable right now. Make sure the backend and Ollama are running.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage()
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#d32323] text-white shadow-xl hover:bg-red-700 transition flex items-center justify-center text-2xl"
        aria-label="Open AI Assistant"
      >
        💬
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-24px)] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-[#d32323] text-white px-4 py-3 flex items-start justify-between">
            <div>
              <p className="font-semibold text-base">YelpClone Assistant</p>
              <p className="text-xs text-white/80">Personalized with your app data</p>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="text-white/90 hover:text-white text-xl leading-none"
            >
              ✕
            </button>
          </div>

          <div className="h-[360px] overflow-y-auto p-4 space-y-3 bg-[#fafafa]">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[85%] px-4 py-3 rounded-2xl whitespace-pre-wrap text-sm leading-6 ${
                  msg.role === 'user'
                    ? 'ml-auto bg-[#d32323] text-white'
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="max-w-[85%] px-4 py-3 rounded-2xl bg-white border border-gray-200 text-gray-500 text-sm">
                Thinking...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask for food ideas or recommendations..."
                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 outline-none text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#d32323] hover:bg-red-700 text-white px-4 rounded-xl font-semibold text-sm shrink-0"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}