import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Footer from '../../components/layout/Footer'
import { getRestaurants } from '../../services/restaurantService'
import { sendMessage as sendAIMessage } from '../../services/aiService'

/* ─── Mock AI responses ───────────────────────────────────────────── */
const SUGGESTED_PROMPTS = [
  'Find me a romantic Italian restaurant under $50',
  'Best brunch spots open on Sunday',
  'Top-rated sushi near Downtown',
  'Where should I go for a business dinner?',
  'Compare The Golden Fork vs Sakura Garden',
]

const MOCK_AI_RESPONSES = {
  default: (q) => `Great question! Based on the restaurants in your area, here are my top picks for "${q}":\n\n**1. The Golden Fork** — Exceptional Italian cuisine with a romantic ambiance. Perfect for a special night out. Rating: 4.8★\n\n**2. Sakura Garden** — Outstanding sushi and omakase experience in West Hollywood. Rating: 4.7★\n\n**3. Harbor Light Bistro** — Fresh seafood with stunning waterfront views in Marina del Rey. Rating: 4.7★\n\nWould you like more details about any of these, or should I filter by price, cuisine, or location?`,
  romantic: () => `For a romantic dinner in Los Angeles, I'd recommend:\n\n**1. Maison Blanche** (Beverly Hills) — White-glove French fine dining with an intimate atmosphere. Prix fixe menu is exquisite. $$$$\n\n**2. The Golden Fork** (Downtown) — Candlelit Italian with housemade pasta. Perfect for anniversaries. $$\n\n**3. Harbor Light Bistro** (Marina del Rey) — Waterfront views at sunset are absolutely stunning. $$$\n\nShall I check availability for any of these?`,
  brunch: () => `Top brunch spots currently open in your area:\n\n**1. The Fig Tree Café** (Los Feliz) — Best eggs benedict in the city. Gorgeous outdoor patio. $$\n\n**2. Blue Moon Diner** (Hollywood) — Classic American diner, open 24 hours. Famous for fluffy pancakes. $\n\n**3. Harbor Light Bistro** (Marina del Rey) — Upscale brunch with bottomless mimosas and ocean views. $$$\n\nAll three are highly rated and open right now!`,
  compare: () => `**The Golden Fork vs. Sakura Garden** — here's the breakdown:\n\n| | The Golden Fork | Sakura Garden |\n|---|---|---|\n| Cuisine | Italian | Japanese/Sushi |\n| Rating | ⭐ 4.8 | ⭐ 4.7 |\n| Price | $$ | $$ |\n| Best for | Date night, fine dining | Omakase, sake bar |\n| Wait time | ~20 min | ~35 min |\n\n**My pick:** The Golden Fork for a classic romantic dinner; Sakura Garden if you want an adventurous omakase experience.`,
}

function getAIResponse(message) {
  const lower = message.toLowerCase()
  if (lower.includes('romantic') || lower.includes('date')) return MOCK_AI_RESPONSES.romantic()
  if (lower.includes('brunch') || lower.includes('breakfast') || lower.includes('sunday')) return MOCK_AI_RESPONSES.brunch()
  if (lower.includes('compare') || lower.includes('vs') || lower.includes('versus')) return MOCK_AI_RESPONSES.compare()
  return MOCK_AI_RESPONSES.default(message)
}

/* ─── AI Assistant Panel ──────────────────────────────────────────── */
function AIAssistantPanel({ query, location }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hi! I'm your Yelp AI Assistant. I can help you find the perfect restaurant in **${location}**. Ask me anything — cuisine type, budget, occasion, dietary needs, or even compare specific places!`,
    },
  ])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const bottomRef               = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = (text) => {
    if (!text.trim()) return
    const userMsg = { role: 'user', text: text.trim() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)
    const history = messages.map((m) => ({ role: m.role, content: m.text }))
    sendAIMessage(text, history)
      .then((res) => {
        const { reply, recommendations } = res.data
        let full = reply
        if (recommendations?.length) {
          full += '\n\n' + recommendations.map((r, i) =>
            `**${i + 1}. ${r.name}** (${r.cuisine_type || ''}) — ${r.city || ''} · ${r.pricing_tier || ''} · ⭐ ${r.avg_rating?.toFixed(1) ?? 'N/A'}`
          ).join('\n')
        }
        setMessages((m) => [...m, { role: 'assistant', text: full }])
      })
      .catch(() => {
        setMessages((m) => [...m, { role: 'assistant', text: getAIResponse(text) }])
      })
      .finally(() => setLoading(false))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  // Simple markdown bold renderer
  const renderText = (text) =>
    text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g)
      return (
        <p key={i} className={`${line === '' ? 'mt-2' : ''}`}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
        </p>
      )
    })

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Panel header */}
      <div className="px-5 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#d32323] flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
            </svg>
          </div>
          <div>
            <p className="yelp-b3-bold text-gray-900">Yelp AI Assistant</p>
            <p className="yelp-b4 text-green-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              Online
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-[#d32323] flex items-center justify-center shrink-0 mt-1 mr-2">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
                </svg>
              </div>
            )}
            <div
              className={`max-w-[82%] px-4 py-3 rounded-2xl yelp-b4 leading-relaxed space-y-0.5 ${
                msg.role === 'user'
                  ? 'bg-[#d32323] text-white rounded-tr-sm'
                  : 'bg-gray-100 text-gray-800 rounded-tl-sm'
              }`}
            >
              {renderText(msg.text)}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-7 h-7 rounded-full bg-[#d32323] flex items-center justify-center shrink-0 mt-1 mr-2">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
              </svg>
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts — only show if only 1 message (intro) */}
      {messages.length === 1 && (
        <div className="px-4 pb-3">
          <p className="yelp-b4 text-gray-400 mb-2">Try asking:</p>
          <div className="flex flex-col gap-1.5">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-left yelp-b4 text-[#d32323] bg-red-50 border border-red-100 rounded-lg px-3 py-2 hover:bg-red-100 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about restaurants…"
            className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 yelp-b4 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#d32323]"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-full bg-[#d32323] flex items-center justify-center text-white hover:bg-red-700 disabled:opacity-40 shrink-0"
          >
            <svg className="w-4 h-4 rotate-90" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

/* ─── Mock Data ───────────────────────────────────────────────── */
const MOCK_RESTAURANTS = [
  { id: 1, rank: 1, name: 'The Golden Fork', rating: 4.8, reviewCount: 1243, neighborhood: 'Downtown', price: '$$', isOpen: true, hours: 'Closes 10:00 PM', reviewSnippet: 'Absolutely incredible experience from start to finish. The pasta was perfectly al dente and the service was impeccable. We\'ll definitely be back for special occasions — the ambiance alone is worth a visit...', tags: ['Italian', 'Pasta', 'Date Night', 'Fine Dining'] },
  { id: 2, rank: 2, name: 'Harbor Light Bistro', rating: 4.7, reviewCount: 892, neighborhood: 'Marina del Rey', price: '$$$', isOpen: true, hours: 'Closes 11:00 PM', reviewSnippet: 'The seafood here is sourced fresh daily and it really shows. The lobster bisque alone is worth the trip across town. Great spot for a romantic waterfront dinner...', tags: ['Seafood', 'Waterfront', 'Romantic', 'Brunch'] },
  { id: 3, rank: 3, name: 'Sakura Garden', rating: 4.7, reviewCount: 2156, neighborhood: 'West Hollywood', price: '$$', isOpen: true, hours: 'Closes 10:30 PM', reviewSnippet: 'Best sushi in the city, hands down. The omakase is a must-do if you\'re willing to splurge a little. Every piece is a work of art — fresh, flavorful, and beautifully presented...', tags: ['Sushi', 'Japanese', 'Omakase', 'Sake Bar'] },
  { id: 4, rank: 4, name: 'Ember & Oak', rating: 4.6, reviewCount: 1876, neighborhood: 'Silver Lake', price: '$$', isOpen: false, hours: 'Opens 5:00 PM', reviewSnippet: 'The smoked brisket is absolutely legendary. Been coming here for years and it never disappoints. The sides are just as good — don\'t sleep on the mac and cheese...', tags: ['BBQ', 'American', 'Outdoor Seating', 'Group Friendly'] },
  { id: 5, rank: 5, name: 'Casa Mendoza', rating: 4.6, reviewCount: 3421, neighborhood: 'East Los Angeles', price: '$', isOpen: true, hours: 'Closes 9:00 PM', reviewSnippet: 'Authentic Mexican food at its finest. The carnitas tacos are life-changing and the margaritas are dangerously good. This place gets packed on weekends so come early...', tags: ['Mexican', 'Tacos', 'Margaritas', 'Casual'] },
  { id: 6, rank: 6, name: 'The Fig Tree Café', rating: 4.5, reviewCount: 987, neighborhood: 'Los Feliz', price: '$$', isOpen: true, hours: 'Closes 9:30 PM', reviewSnippet: 'A hidden gem with the most charming patio. The hummus platter is incredible and the roasted lamb is perfectly seasoned. Vegetarian options are abundant and creative...', tags: ['Mediterranean', 'Vegetarian-Friendly', 'Patio', 'Brunch'] },
  { id: 7, rank: 7, name: 'Maison Blanche', rating: 4.5, reviewCount: 654, neighborhood: 'Beverly Hills', price: '$$$$', isOpen: true, hours: 'Closes 10:00 PM', reviewSnippet: 'Special occasion dining at its best. The prix fixe menu is expertly curated and the wine list is impressive. Service is white-glove without being stuffy or pretentious...', tags: ['French', 'Fine Dining', 'Prix Fixe', 'Wine Bar'] },
  { id: 8, rank: 8, name: 'Pho 75', rating: 4.5, reviewCount: 2987, neighborhood: 'Koreatown', price: '$', isOpen: true, hours: 'Open 24 Hours', reviewSnippet: 'The broth has clearly been simmering for days — rich, complex, and deeply satisfying. Giant portions at unbeatable prices. A go-to spot after a long night out...', tags: ['Vietnamese', 'Pho', 'Late Night', 'Noodles'] },
  { id: 9, rank: 9, name: 'The Spice Route', rating: 4.4, reviewCount: 1432, neighborhood: 'Culver City', price: '$$', isOpen: false, hours: 'Opens 11:30 AM', reviewSnippet: 'Incredible depth of flavor in every dish. The butter chicken is smooth and indulgent, the naan is pillowy soft. Generous portions and a warm, welcoming atmosphere...', tags: ['Indian', 'Curry', 'Delivery', 'Vegetarian Options'] },
  { id: 10, rank: 10, name: 'Blue Moon Diner', rating: 4.4, reviewCount: 4231, neighborhood: 'Hollywood', price: '$', isOpen: true, hours: 'Open 24 Hours', reviewSnippet: 'The classic American diner done right. Fluffy pancakes, crispy bacon, and the best bottomless coffee in the city. A neighborhood staple that\'s been here for decades...', tags: ['Diner', 'Breakfast', 'Late Night', 'American'] },
]

const RELATED_SEARCHES = ['Best Restaurants Downtown', 'Restaurants with Outdoor Seating', 'Romantic Restaurants LA', 'Restaurants Open Late', 'Cheap Eats Los Angeles', 'Restaurants Near Me Open Now']
const TRENDING_SEARCHES = ['Brunch Spots Los Angeles', 'Rooftop Bars LA', 'Best Tacos Near Me', 'Vegan Restaurants', 'Happy Hour Deals', 'Date Night Restaurants']
const SEASONAL_SEARCHES = ['Spring Dining Patios', 'Outdoor BBQ Spots', 'Easter Brunch 2025', 'Farmers Market Nearby', 'Spring Cocktail Menus', 'Farm to Table Restaurants']
const MORE_NEARBY = ['Bars & Clubs', 'Coffee & Tea', 'Bakeries', 'Pizza Places', 'Burger Joints', 'Dessert Shops']
const LANDMARKS = ['Restaurants Near Griffith Park', 'Dining Near The Getty', 'Eats Near Dodger Stadium', 'Near Venice Beach Boardwalk', 'Near Hollywood Walk of Fame', 'Near The Grove']
const POPULAR_BRANDS = ['Shake Shack', 'The Cheesecake Factory', 'Nobu', 'Din Tai Fung', 'In-N-Out Burger', 'Bottega Louie']
const NEARBY_CITIES = ['Pasadena', 'Santa Monica', 'Burbank', 'Glendale', 'Long Beach', 'Torrance']
const NEIGHBORHOODS = ['Silver Lake', 'Los Feliz', 'Echo Park', 'Koreatown', 'Westwood', 'Brentwood']
const STREETS = ['Melrose Ave', 'Sunset Blvd', 'Wilshire Blvd', 'Santa Monica Blvd', 'Venice Blvd', 'La Brea Ave']
const CAMPUSES = ['Near UCLA', 'Near USC', 'Near LMU', 'Near Cal State LA', 'Near Pepperdine', 'Near CSUN']

function StarRating({ rating }) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`w-5 h-5 ${i <= full ? 'text-[#d32323]' : i === full + 1 && half ? 'text-[#d32323]' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
          {i <= full ? (
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          ) : i === full + 1 && half ? (
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" clipPath="url(#half)" />
          ) : (
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" fill="none" stroke="currentColor" strokeWidth="1" />
          )}
        </svg>
      ))}
    </div>
  )
}

function RestaurantTile({ restaurant }) {
  const [photoIndex, setPhotoIndex] = useState(0)
  const bgColors = ['bg-amber-100', 'bg-blue-100', 'bg-green-100', 'bg-rose-100', 'bg-purple-100', 'bg-yellow-100', 'bg-indigo-100', 'bg-orange-100', 'bg-teal-100', 'bg-pink-100']
  const bg = bgColors[(restaurant.rank - 1) % bgColors.length]

  return (
    <div className="flex gap-6 py-8 border-b border-gray-200">
      {/* Photo */}
      <div className={`relative w-52 h-44 rounded-lg overflow-hidden shrink-0 ${bg} flex items-center justify-center`}>
        <span className="yelp-h4 text-gray-400">{restaurant.rank}</span>
        {/* Photo nav arrows */}
        <button
          onClick={() => setPhotoIndex((i) => Math.max(0, i - 1))}
          className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center shadow text-gray-700 hover:bg-white text-base"
        >‹</button>
        <button
          onClick={() => setPhotoIndex((i) => i + 1)}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center shadow text-gray-700 hover:bg-white text-base"
        >›</button>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        {/* Name */}
        <Link to={`/restaurants/${restaurant.id}`} className="yelp-b1-bold text-gray-900 hover:text-[#d32323]">
          {restaurant.rank}. {restaurant.name}
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-2 mt-1.5">
          <StarRating rating={restaurant.rating} />
          <span className="yelp-b2-bold text-gray-800">{restaurant.rating}</span>
          <span className="yelp-b2 text-gray-500">({restaurant.reviewCount.toLocaleString()} reviews)</span>
        </div>

        {/* Location / Price / Hours */}
        <div className="flex items-center gap-1.5 mt-1.5 yelp-b2 text-gray-600">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>{restaurant.neighborhood}</span>
          <span className="text-gray-400">·</span>
          <span>{restaurant.price}</span>
          <span className="text-gray-400">·</span>
          <span className={restaurant.isOpen ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'}>
            {restaurant.isOpen ? 'Open Now' : 'Closed'}
          </span>
          <span className="text-gray-400">·</span>
          <span>{restaurant.hours}</span>
        </div>

        {/* Review snippet */}
        <div className="flex items-start gap-2 mt-2.5">
          <svg className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="yelp-b2 text-gray-500 line-clamp-2">
            "{restaurant.reviewSnippet.slice(0, 130)}<span className="text-blue-600 cursor-pointer"> more</span>"
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {restaurant.tags.map((tag) => (
            <button key={tag} className="yelp-b3 px-4 py-1.5 rounded-full border border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50 whitespace-nowrap">
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Main Component ───────────────────────────────────────────── */
export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query    = searchParams.get('query')    || 'Restaurants'
  const location = searchParams.get('location') || 'Los Angeles, CA'

  const [headerCompact, setHeaderCompact]     = useState(false)
  const [sortBy, setSortBy]                   = useState('Recommended')
  const [showSortMenu, setShowSortMenu]       = useState(false)
  const [showAllFilters, setShowAllFilters]   = useState(false)
  const [showPriceFilter, setShowPriceFilter] = useState(false)
  const [selectedPrices, setSelectedPrices]   = useState([])
  const [activeFilters, setActiveFilters]     = useState({ openNow: false, reservations: false, waitlist: false, delivery: false, takeout: false })
  const [searchAsMapMoves, setSearchAsMapMoves] = useState(true)
  const [currentPage, setCurrentPage]         = useState(1)
  const [showAssistant, setShowAssistant]     = useState(false)
  const [restaurants, setRestaurants]         = useState(MOCK_RESTAURANTS)
  const [loadingResults, setLoadingResults]   = useState(true)

  const allFiltersRef = useRef(null)

  useEffect(() => {
    setLoadingResults(true)
    const city = location.split(',')[0]?.trim()
    getRestaurants({ q: query !== 'Restaurants' ? query : undefined, city })
      .then((res) => setRestaurants(res.data))
      .catch(() => {})
      .finally(() => setLoadingResults(false))
  }, [query, location])

  // Collapse category row on scroll
  useEffect(() => {
    const handleScroll = () => setHeaderCompact(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('[data-dropdown]')) {
        setShowSortMenu(false)
        setShowPriceFilter(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const now      = new Date()
  const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  const SORT_OPTIONS = ['Recommended', 'Highest Rated', 'Most Reviewed']
  const PRICE_OPTIONS = ['$', '$$', '$$$', '$$$$']

  const togglePrice = (p) => setSelectedPrices((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])
  const toggleFilter = (key) => setActiveFilters((prev) => ({ ...prev, [key]: !prev[key] }))

  const filterBtnCls = (active) =>
    `yelp-b2 px-5 py-2 rounded-full border whitespace-nowrap transition-colors ${active ? 'border-[#d32323] bg-red-50 text-[#d32323]' : 'border-gray-300 text-gray-700 bg-white hover:border-gray-400'}`

  const threeColGrid = (items) => (
    <div className="grid grid-cols-3 gap-x-8 gap-y-2 mt-2">
      {items.map((item) => (
        <button key={item} className="yelp-b2 text-gray-500 hover:text-[#d32323] text-left">{item}</button>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-white">

      {/* ── Sticky Header ─────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <PageHeader variant="light" compact={headerCompact} showProfileNav={false} />
      </div>

      {/* ── Two-Column Body ──────────────────────────────────── */}
      <div className="flex min-h-screen">

        {/* ══ LEFT: Results column ══════════════════════════════ */}
        <div className="w-[65%] px-20 py-10 overflow-y-auto">

          {/* Header */}
          <p className="yelp-b2 text-gray-500 mb-1">{query}</p>
          <div className="flex items-start justify-between gap-4">
            <h1 className="yelp-h2 text-gray-900 leading-tight">
              Top 10 Best Restaurants Near {location}
            </h1>
            {/* Sort */}
            <div className="relative shrink-0 mt-2" data-dropdown>
              <button
                onClick={() => setShowSortMenu((v) => !v)}
                className="flex items-center gap-2 yelp-b2 text-gray-700 hover:text-gray-900"
              >
                <span className="text-gray-500">Sort:</span>
                <span className="font-semibold">{sortBy}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                {/* Info circle */}
                <span className="w-5 h-5 rounded-full border border-gray-400 text-gray-400 text-xs flex items-center justify-center font-bold">i</span>
              </button>
              {showSortMenu && (
                <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[200px]">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setSortBy(opt); setShowSortMenu(false) }}
                      className={`block w-full text-left px-5 py-3 yelp-b2 hover:bg-gray-50 ${sortBy === opt ? 'text-[#d32323] font-semibold' : 'text-gray-700'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Filter Buttons ──────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            {/* All filters */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setShowAllFilters(true)}
                className={`flex items-center gap-2 ${filterBtnCls(false)}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M10 18h4" />
                </svg>
                All
              </button>
            </div>

            {/* Price */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setShowPriceFilter((v) => !v)}
                className={`flex items-center gap-1 ${filterBtnCls(selectedPrices.length > 0)}`}
              >
                Price
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showPriceFilter && (
                <div className="absolute left-0 top-10 bg-white border border-gray-200 rounded-xl shadow-xl z-20 p-4 min-w-[200px]">
                  <p className="yelp-b3-semi text-gray-700 mb-3">Price</p>
                  <div className="flex gap-2 mb-4">
                    {PRICE_OPTIONS.map((p) => (
                      <button
                        key={p}
                        onClick={() => togglePrice(p)}
                        className={`px-3 py-1.5 rounded border yelp-b3 transition-colors ${selectedPrices.includes(p) ? 'border-[#d32323] bg-red-50 text-[#d32323]' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowPriceFilter(false)}
                    className="w-full bg-[#d32323] text-white rounded-lg py-2 yelp-b3-semi hover:bg-red-700"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => toggleFilter('openNow')}    className={filterBtnCls(activeFilters.openNow)}>Open Now</button>
            <button onClick={() => toggleFilter('reservations')} className={filterBtnCls(activeFilters.reservations)}>Reservations</button>
            <button onClick={() => toggleFilter('waitlist')}   className={filterBtnCls(activeFilters.waitlist)}>Offers Online Waitlist</button>
            <button onClick={() => toggleFilter('delivery')}   className={filterBtnCls(activeFilters.delivery)}>Offers Delivery</button>
            <button onClick={() => toggleFilter('takeout')}    className={filterBtnCls(activeFilters.takeout)}>Offers Takeout</button>

            {/* AI Assistant toggle */}
            <button
              onClick={() => setShowAssistant((v) => !v)}
              className={`ml-auto flex items-center gap-2 yelp-b2 px-5 py-2 rounded-full border whitespace-nowrap transition-colors ${showAssistant ? 'bg-[#d32323] border-[#d32323] text-white' : 'border-[#d32323] text-[#d32323] hover:bg-red-50'}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
              </svg>
              {showAssistant ? 'Hide Assistant' : 'Ask Assistant'}
            </button>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Results label */}
          <p className="yelp-b1-bold text-gray-900 mb-5">
            All "{query.toLowerCase()}" results near me in {location} — {monthYear}
          </p>

          {/* Restaurant tiles */}
          {loadingResults ? (
            <div className="py-16 text-center yelp-b2 text-gray-400">Loading restaurants…</div>
          ) : restaurants.slice((currentPage - 1) * 10, currentPage * 10).map((r, idx) => (
            <RestaurantTile key={r.id} restaurant={{
              id:             r.id,
              rank:           r.rank ?? idx + 1,
              name:           r.name,
              rating:         r.avg_rating   ?? r.rating       ?? 0,
              reviewCount:    r.review_count ?? r.reviewCount  ?? 0,
              neighborhood:   r.city         ?? r.neighborhood ?? '',
              price:          r.pricing_tier ?? r.price        ?? '$',
              isOpen:         r.isOpen       ?? true,
              hours:          r.hours        ?? '',
              reviewSnippet:  r.description  ?? r.reviewSnippet ?? '',
              tags:           r.tags ?? [r.cuisine_type, ...(r.amenities ? r.amenities.split(',').map(a => a.trim()) : [])].filter(Boolean),
            }} />
          ))}

          {/* ── Pagination ──────────────────────────────────── */}
          {(() => {
            const totalPages = Math.max(1, Math.ceil(restaurants.length / 10))
            return (
          <div className="flex items-center justify-between mt-8 mb-5">
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-11 h-11 rounded flex items-center justify-center yelp-b2 transition-colors ${currentPage === p ? 'bg-[#d32323] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="bg-[#d32323] text-white px-10 py-3 rounded-lg yelp-b2-semi hover:bg-red-700"
            >
              Next Page
            </button>
          </div>
            )
          })()}

          <hr className="my-8 border-gray-200" />

          {/* ── Can't find business ─────────────────────────── */}
          <div className="border border-dashed border-gray-300 rounded-xl p-6 flex items-center justify-between mb-7">
            <div>
              <p className="yelp-b1-bold text-gray-900">Can't find the business?</p>
              <p className="yelp-b2 text-gray-500 mt-1">Adding a business to Yelp is always free.</p>
            </div>
            <Link to="/restaurants/new">
              <button className="yelp-b2 bg-gray-100 border border-gray-300 rounded-full px-6 py-2.5 text-gray-700 hover:bg-gray-200 whitespace-nowrap">
                Add Business
              </button>
            </Link>
          </div>

          {/* Feedback */}
          <p className="yelp-b2 text-gray-500 mb-9">
            Got search feedback?{' '}
            <button className="text-blue-600 hover:underline">Help us improve.</button>
          </p>

          {/* ── Related / Trending / Seasonal / etc. ─────────── */}
          {[
            { title: `Related Searches in ${location}`,     items: RELATED_SEARCHES },
            { title: `Trending Searches in ${location}`,    items: TRENDING_SEARCHES },
            { title: `Seasonal Searches in ${location}`,    items: SEASONAL_SEARCHES },
            { title: 'More Nearby',                         items: MORE_NEARBY },
            { title: `Browse "Restaurants" near Landmarks`, items: LANDMARKS },
            { title: `Popular Brands in ${location}`,       items: POPULAR_BRANDS },
          ].map(({ title, items }) => (
            <div key={title} className="mb-9">
              <p className="yelp-b1-bold text-gray-900 mb-2">{title}</p>
              {threeColGrid(items)}
            </div>
          ))}

          {/* ── Search restaurants in popular locations ────── */}
          <div className="mb-12">
            <p className="yelp-b1-bold text-gray-900 mb-5">Search restaurants in popular locations</p>
            {[
              { label: 'Nearby Cities',  items: NEARBY_CITIES },
              { label: 'Neighborhoods',  items: NEIGHBORHOODS },
              { label: 'Streets',        items: STREETS },
              { label: 'Campuses',       items: CAMPUSES },
            ].map(({ label, items }) => (
              <div key={label} className="mb-6">
                <p className="yelp-b2-bold text-gray-800 mb-2">{label}</p>
                {threeColGrid(items)}
              </div>
            ))}
          </div>

        </div>

        {/* ══ RIGHT: Map or AI Assistant column ════════════════ */}
        <div className={`flex-1 sticky top-[72px] h-[calc(100vh-72px)] overflow-hidden ${showAssistant ? 'bg-white border-l border-gray-200' : 'bg-gray-200'}`}>

          {/* AI Assistant Panel */}
          {showAssistant && (
            <AIAssistantPanel query={query} location={location} />
          )}

          {/* Map — hidden when assistant is open */}
          <div className={`relative w-full h-full ${showAssistant ? 'hidden' : ''}`}>
            {/* Simulated map background */}
            <div className="w-full h-full bg-gradient-to-br from-gray-100 via-green-50 to-blue-50 relative">
              {/* Grid lines to simulate map */}
              <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#9ca3af" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
              {/* Simulated roads */}
              <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
                <line x1="0" y1="35%" x2="100%" y2="35%" stroke="#d1d5db" strokeWidth="6"/>
                <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#d1d5db" strokeWidth="4"/>
                <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#d1d5db" strokeWidth="6"/>
                <line x1="65%" y1="0" x2="65%" y2="100%" stroke="#d1d5db" strokeWidth="4"/>
                <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#e5e7eb" strokeWidth="2"/>
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#e5e7eb" strokeWidth="2"/>
              </svg>

              {/* Restaurant pins */}
              {[
                { rank: 1, x: '30%', y: '28%' }, { rank: 2, x: '68%', y: '55%' },
                { rank: 3, x: '45%', y: '40%' }, { rank: 4, x: '22%', y: '62%' },
                { rank: 5, x: '55%', y: '25%' }, { rank: 6, x: '38%', y: '70%' },
                { rank: 7, x: '72%', y: '35%' }, { rank: 8, x: '15%', y: '45%' },
                { rank: 9, x: '60%', y: '72%' }, { rank: 10, x: '80%', y: '50%' },
              ].map(({ rank, x, y }) => (
                <div
                  key={rank}
                  className="absolute -translate-x-1/2 -translate-y-full cursor-pointer group"
                  style={{ left: x, top: y }}
                >
                  <div className="w-8 h-8 bg-[#d32323] rounded-full flex items-center justify-center shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                    <span className="text-white text-xs font-bold">{rank}</span>
                  </div>
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-[#d32323] mx-auto" />
                </div>
              ))}
            </div>

            {/* ── Map Controls (all top-right) ─────────────── */}
            <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
              {/* Search as map moves */}
              <div className="bg-white rounded-lg shadow-md px-3 py-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="searchMapMoves"
                  checked={searchAsMapMoves}
                  onChange={(e) => setSearchAsMapMoves(e.target.checked)}
                  className="accent-[#d32323] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="searchMapMoves" className="yelp-b4 text-gray-700 cursor-pointer whitespace-nowrap">
                  Search as map moves
                </label>
              </div>

              {/* Zoom + Expand controls stacked below */}
              <div className="flex flex-col gap-1">
                {/* Expand */}
                <button className="bg-white rounded-lg shadow-md w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
                {/* Zoom in */}
                <button className="bg-white rounded-t-lg shadow-md w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-700 text-xl font-light border-b border-gray-200">
                  +
                </button>
                {/* Zoom out */}
                <button className="bg-white rounded-b-lg shadow-md w-10 h-10 flex items-center justify-center hover:bg-gray-50 text-gray-700 text-xl font-light">
                  −
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <Footer />

      {/* ── All Filters Drawer ──────────────────────────────────── */}
      {showAllFilters && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAllFilters(false)} />
          {/* Drawer */}
          <div className="relative bg-white w-[420px] h-full shadow-2xl flex flex-col overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="yelp-h4 text-gray-900">Filters</h2>
              <button onClick={() => setShowAllFilters(false)} className="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>

            <div className="flex-1 p-6 space-y-7">
              {/* Price */}
              <div>
                <p className="yelp-b1-bold text-gray-900 mb-4">Price</p>
                <div className="flex gap-2">
                  {PRICE_OPTIONS.map((p) => (
                    <button
                      key={p}
                      onClick={() => togglePrice(p)}
                      className={`px-5 py-2 rounded border yelp-b2 transition-colors ${selectedPrices.includes(p) ? 'border-[#d32323] bg-red-50 text-[#d32323]' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggested */}
              <div>
                <p className="yelp-b1-bold text-gray-900 mb-4">Suggested</p>
                <div className="space-y-4">
                  {[
                    { key: 'openNow',       label: 'Open Now' },
                    { key: 'reservations',  label: 'Reservations' },
                    { key: 'waitlist',      label: 'Offers Online Waitlist' },
                    { key: 'delivery',      label: 'Offers Delivery' },
                    { key: 'takeout',       label: 'Offers Takeout' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center justify-between cursor-pointer">
                      <span className="yelp-b2 text-gray-700">{label}</span>
                      <input
                        type="checkbox"
                        checked={activeFilters[key]}
                        onChange={() => toggleFilter(key)}
                        className="accent-[#d32323] w-5 h-5 cursor-pointer"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Dietary Restrictions */}
              <div>
                <p className="yelp-b1-bold text-gray-900 mb-4">Dietary Restrictions</p>
                <div className="space-y-4">
                  {['Vegan', 'Vegetarian', 'Gluten-Free', 'Halal', 'Kosher', 'Dairy-Free'].map((d) => (
                    <label key={d} className="flex items-center justify-between cursor-pointer">
                      <span className="yelp-b2 text-gray-700">{d}</span>
                      <input type="checkbox" className="accent-[#d32323] w-5 h-5 cursor-pointer" />
                    </label>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <p className="yelp-b1-bold text-gray-900 mb-4">Features</p>
                <div className="space-y-4">
                  {['Outdoor Seating', 'Good for Groups', 'Takes Credit Cards', 'Free Wi-Fi', 'Parking Available', 'Dog Friendly'].map((f) => (
                    <label key={f} className="flex items-center justify-between cursor-pointer">
                      <span className="yelp-b2 text-gray-700">{f}</span>
                      <input type="checkbox" className="accent-[#d32323] w-5 h-5 cursor-pointer" />
                    </label>
                  ))}
                </div>
              </div>

              {/* Distance */}
              <div>
                <p className="yelp-b1-bold text-gray-900 mb-4">Distance</p>
                <div className="space-y-3">
                  {['Within 1 mile', 'Within 5 miles', 'Within 10 miles', 'Within 25 miles', 'Any distance'].map((d) => (
                    <label key={d} className="flex items-center gap-3 cursor-pointer">
                      <input type="radio" name="distance" className="accent-[#d32323] w-5 h-5" />
                      <span className="yelp-b2 text-gray-700">{d}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => { setSelectedPrices([]); setActiveFilters({ openNow: false, reservations: false, waitlist: false, delivery: false, takeout: false }); setShowAllFilters(false) }}
                className="flex-1 border border-gray-300 rounded-lg py-3 yelp-b2-semi text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAllFilters(false)}
                className="flex-1 bg-[#d32323] text-white rounded-lg py-3 yelp-b2-semi hover:bg-red-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
