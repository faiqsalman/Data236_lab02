import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Footer from '../../components/layout/Footer'
import ChatWidget from '../../components/ai/ChatWidget'
import api from '../../services/api'
import { setRestaurants as setRestaurantsRedux } from '../../features/restaurants/restaurantSlice'

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80',
]

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

export default function Home() {
  const dispatch = useDispatch()

  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [heroIndex, setHeroIndex] = useState(0)

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const res = await api.get('/restaurants')
        const restaurantList = Array.isArray(res.data) ? res.data : []

        setRestaurants(restaurantList)
        dispatch(setRestaurantsRedux(restaurantList))
      } catch (err) {
        console.error('Failed to load restaurants:', err)
        setRestaurants([])
        dispatch(setRestaurantsRedux([]))
      } finally {
        setLoading(false)
      }
    }

    loadRestaurants()
  }, [dispatch])

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const featuredRestaurants = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => (Number(b.avg_rating) || 0) - (Number(a.avg_rating) || 0))
      .slice(0, 6)
  }, [restaurants])

  return (
    <div className="min-h-screen bg-white">
      <section
        className="relative h-screen flex items-center"
        style={{
          backgroundImage: `url(${HERO_IMAGES[heroIndex]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative max-w-7xl mx-auto px-6 w-full text-white flex flex-col justify-center h-full pt-24">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 max-w-6xl">
            Find the best restaurants near you
          </h1>

          <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl">
            Search restaurants, read reviews, and discover your next favorite spot.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Popular Restaurants
          </h2>
          <Link to="/search" className="text-[#d32323] hover:underline font-medium">
            View more
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading restaurants...</p>
        ) : featuredRestaurants.length === 0 ? (
          <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
            <p className="text-gray-600">
              No restaurants found yet. Add restaurants from the app or Swagger first.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRestaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                to={`/restaurants/${restaurant.id}`}
                className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition bg-white"
              >
                <div className="h-52 bg-gray-100 overflow-hidden">
                  <img
                    src={getRestaurantImage(restaurant)}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
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

      <ChatWidget />
      <Footer />
    </div>
  )
}