import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Footer from '../../components/layout/Footer'
import api from '../../services/api'

function useQuery() {
  return new URLSearchParams(useLocation().search)
}

function Stars({ rating = 0 }) {
  const rounded = Math.round(Number(rating) || 0)

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rounded ? 'text-red-500' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
  )
}

function getRestaurantImage(restaurant) {
  const cuisine = (restaurant?.cuisine_type || '').toLowerCase()
  const name = (restaurant?.name || '').toLowerCase()

  if (name.includes('pizza') || cuisine.includes('italian')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80'
  }
  if (name.includes('burger') || cuisine.includes('american')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80'
  }
  if (cuisine.includes('indian')) {
    return 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80'
  }
  if (cuisine.includes('chinese')) {
    return 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=80'
  }
  if (cuisine.includes('mexican') || name.includes('taco')) {
    return 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1200&q=80'
  }

  return 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80'
}

export default function SearchResults() {
  const query = useQuery()
  const navigate = useNavigate()
  const q = query.get('q') || ''

  const [search, setSearch] = useState(q)
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchBoxRef = useRef(null)

  useEffect(() => {
    setSearch(q)
  }, [q])

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await api.get('/restaurants', {
          params: q ? { q } : {},
        })
        setRestaurants(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        console.error('Search failed:', err)
        setError(err.response?.data?.detail || 'Failed to search restaurants.')
        setRestaurants([])
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [q])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const queryText = search.trim()

    if (!queryText) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/restaurants', {
          params: { q: queryText },
        })

        const data = Array.isArray(res.data) ? res.data : []

        const sorted = [...data].sort((a, b) => {
          const aName = (a.name || '').toLowerCase()
          const bName = (b.name || '').toLowerCase()
          const qLower = queryText.toLowerCase()

          const aStarts = aName.startsWith(qLower) ? 1 : 0
          const bStarts = bName.startsWith(qLower) ? 1 : 0

          if (aStarts !== bStarts) return bStarts - aStarts
          return (Number(b.avg_rating) || 0) - (Number(a.avg_rating) || 0)
        })

        setSuggestions(sorted.slice(0, 6))
        setShowSuggestions(true)
      } catch (err) {
        console.error('Failed to load suggestions:', err)
        setSuggestions([])
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [search])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const trimmed = search.trim()
    if (!trimmed) return
    setShowSuggestions(false)
    navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  const heading = useMemo(() => {
    return q ? `Results for "${q}"` : 'All restaurants'
  }, [q])

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8" ref={searchBoxRef}>
          <form
            onSubmit={handleSearchSubmit}
            className="bg-white border border-gray-200 rounded-2xl p-2 flex flex-col md:flex-row gap-2 shadow-sm max-w-4xl"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true)
              }}
              placeholder="Search for restaurants, pizza, burgers..."
              className="flex-1 px-5 py-4 rounded-xl text-gray-900 outline-none text-lg"
            />

            <button
              type="submit"
              className="bg-[#d32323] hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold transition"
            >
              Search
            </button>
          </form>

          {showSuggestions && search.trim() && (
            <div className="mt-2 max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-20 relative">
              {suggestions.length === 0 ? (
                <div className="px-5 py-4 text-gray-500">No matching restaurants found</div>
              ) : (
                suggestions.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    type="button"
                    onClick={() => {
                      setShowSuggestions(false)
                      navigate(`/restaurants/${restaurant.id}`)
                    }}
                    className="w-full text-left px-5 py-4 hover:bg-gray-50 border-b last:border-b-0 border-gray-100 flex items-center gap-4"
                  >
                    <img
                      src={getRestaurantImage(restaurant)}
                      alt={restaurant.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0"
                    />

                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{restaurant.name}</p>
                      <p className="text-sm text-gray-500 truncate">
                        {[restaurant.address, restaurant.city].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-2">
            <Link to="/" className="hover:underline">
              Home
            </Link>{' '}
            / Search
          </p>
          <h1 className="text-5xl font-bold text-gray-900">{heading}</h1>
          <p className="text-gray-600 mt-3 text-2xl">
            {loading
              ? 'Searching restaurants...'
              : `${restaurants.length} recommendation${restaurants.length === 1 ? '' : 's'} found`}
          </p>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading search results...</p>
        ) : error ? (
          <div className="border border-red-200 bg-red-50 rounded-xl p-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            <p className="text-gray-700 font-medium mb-2">No recommendations found.</p>
            <p className="text-gray-600">
              Try pizza, burger, indian, chinese, mexican, italian, or a city name.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                to={`/restaurants/${restaurant.id}`}
                className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition bg-white"
              >
                <div className="h-72 bg-gray-100 overflow-hidden">
                  <img
                    src={getRestaurantImage(restaurant)}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {restaurant.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-2">
                    <Stars rating={restaurant.avg_rating} />
                    <span className="text-sm text-gray-600">
                      {(Number(restaurant.avg_rating) || 0).toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({restaurant.review_count || 0} reviews)
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-1">
                    {[restaurant.cuisine_type, restaurant.pricing_tier]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>

                  <p className="text-sm text-gray-600 mb-3">
                    {[restaurant.address, restaurant.city].filter(Boolean).join(', ')}
                  </p>

                  <p className="text-sm text-gray-700 line-clamp-3">
                    {restaurant.description || 'No description available yet.'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}