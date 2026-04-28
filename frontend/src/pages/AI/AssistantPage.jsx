import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const DEFAULT_MESSAGES = [
  {
    role: 'assistant',
    content:
      'Hi! I’m your YelpClone Assistant. Ask me for halal food, date-night places, cuisines, quick lunch spots, or personalized restaurant recommendations.',
    recommendations: [],
  },
]

function normalizeText(value) {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getSuggestedRecommendations(reply, recommendations) {
  if (!Array.isArray(recommendations) || recommendations.length === 0) return []

  const normalizedReply = normalizeText(reply)

  const matched = recommendations.filter((restaurant) => {
    const fullName = normalizeText(restaurant.name)
    if (!fullName) return false

    if (normalizedReply.includes(fullName)) return true

    const significantWords = fullName
      .split(' ')
      .filter((word) => word.length >= 4)

    const matchedWords = significantWords.filter((word) =>
      normalizedReply.includes(word)
    )

    return significantWords.length > 0 && matchedWords.length >= 2
  })

  return matched
}

function RestaurantCard({ restaurant }) {
  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="block rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-red-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-gray-900">
            {restaurant.name}
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {[restaurant.cuisine_type, restaurant.city].filter(Boolean).join(' · ')}
          </p>
        </div>

        <div className="shrink-0 rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-[#d32323]">
          {(Number(restaurant.avg_rating) || 0).toFixed(1)} ★
        </div>
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-5 text-gray-600">
        {restaurant.description || 'No description available yet.'}
      </p>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>{restaurant.review_count || 0} reviews</span>
        <span className="font-medium text-[#d32323]">View restaurant</span>
      </div>
    </Link>
  )
}

export default function AssistantPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

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

    const nextMessages = [
      ...messages,
      { role: 'user', content: trimmed, recommendations: [] },
    ]

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

      const reply = res.data.reply || 'Sorry, I could not generate a response.'
      const rawRecommendations = Array.isArray(res.data.recommendations)
        ? res.data.recommendations
        : []

      const aiRecommendations = getSuggestedRecommendations(reply, rawRecommendations)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          recommendations: aiRecommendations,
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err.response?.data?.detail ||
            'The assistant is unavailable right now. Make sure the backend and Ollama are running.',
          recommendations: [],
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
    <div className="min-h-screen bg-[#faf7f5]">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-[280px] flex-col border-r border-gray-200 bg-white lg:flex">
          <div className="border-b border-gray-200 px-6 py-5">
            <button
              onClick={() => navigate('/')}
              className="text-left text-3xl font-bold text-[#d32323]"
            >
              Yelp
            </button>
            <p className="mt-2 text-sm text-gray-500">
              AI-powered restaurant help, personalized with your app data.
            </p>
          </div>

          <div className="flex-1 px-6 py-6">
            <div className="rounded-2xl bg-red-50 p-4">
              <p className="text-sm font-semibold text-[#d32323]">Try asking</p>
              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <p>“Give me halal dinner options”</p>
                <p>“Best date-night places near me”</p>
                <p>“Show me highly rated sushi spots”</p>
                <p>“What should I eat tonight?”</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex min-h-screen flex-1 flex-col">
          <div className="border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">YelpClone Assistant</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Ask for restaurants, cuisines, dietary options, and recommendations.
                </p>
              </div>

              <button
                onClick={() => navigate('/')}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Back to Home
              </button>
            </div>
          </div>

          <div className="flex-1 px-4 py-6 sm:px-6">
            <div className="mx-auto flex h-[calc(100vh-140px)] max-w-4xl flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
                <div className="space-y-6">
                  {messages.map((msg, idx) => (
                    <div key={idx} className="space-y-3">
                      <div
                        className={`max-w-[85%] whitespace-pre-wrap rounded-3xl px-5 py-4 text-[15px] leading-7 ${
                          msg.role === 'user'
                            ? 'ml-auto bg-[#d32323] text-white'
                            : 'bg-gray-50 text-gray-800'
                        }`}
                      >
                        {msg.content}
                      </div>

                      {msg.role === 'assistant' &&
                        Array.isArray(msg.recommendations) &&
                        msg.recommendations.length > 0 && (
                          <div className="grid max-w-[85%] gap-3 sm:grid-cols-2">
                            {msg.recommendations.map((restaurant) => (
                              <RestaurantCard
                                key={restaurant.id || restaurant.name}
                                restaurant={restaurant}
                              />
                            ))}
                          </div>
                        )}
                    </div>
                  ))}

                  {loading && (
                    <div className="max-w-[85%] rounded-3xl bg-gray-50 px-5 py-4 text-sm text-gray-500">
                      Thinking...
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="border-t border-gray-200 bg-white px-4 py-4 sm:px-6"
              >
                <div className="flex items-end gap-3">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask for halal spots, date-night ideas, quick lunch options, or anything food-related..."
                    rows={2}
                    className="max-h-40 min-h-[56px] flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-4 text-sm outline-none focus:border-red-400"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-2xl bg-[#d32323] px-6 py-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-70"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}