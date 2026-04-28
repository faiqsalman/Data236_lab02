import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import PageHeader from '../../components/layout/PageHeader'
import Footer from '../../components/layout/Footer'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { claimRestaurant } from '../../services/restaurantService'
import {
  setSelectedRestaurant,
  clearSelectedRestaurant,
} from '../../features/restaurants/restaurantSlice'
import { setReviews, clearReviews } from '../../features/reviews/reviewSlice'

function Stars({ rating = 0, size = 'text-base' }) {
  const rounded = Math.round(Number(rating) || 0)

  return (
    <div className={`flex items-center gap-1 ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rounded ? 'text-red-500' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
  )
}

function formatDate(dateString) {
  if (!dateString) return 'Recently'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return date.toLocaleDateString()
}

function getRestaurantImage(restaurant) {
  const cuisine = (restaurant?.cuisine_type || '').toLowerCase()
  const name = (restaurant?.name || '').toLowerCase()

  if (name.includes('pizza') || cuisine.includes('italian')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1600&q=80'
  }
  if (name.includes('burger') || cuisine.includes('american')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1600&q=80'
  }
  if (cuisine.includes('indian')) {
    return 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1600&q=80'
  }
  if (cuisine.includes('chinese')) {
    return 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1600&q=80'
  }
  if (cuisine.includes('mexican') || name.includes('taco')) {
    return 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1600&q=80'
  }

  return 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80'
}

export default function RestaurantDetails() {
  const { id } = useParams()
  const { user } = useAuth()
  const dispatch = useDispatch()

  const [restaurant, setRestaurant] = useState(null)
  const [reviews, setReviewsState] = useState([])
  const [loadingRestaurant, setLoadingRestaurant] = useState(true)
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadRestaurant = async () => {
      try {
        const res = await api.get(`/restaurants/${id}`)
        setRestaurant(res.data)
        dispatch(setSelectedRestaurant(res.data))
      } catch (err) {
        console.error('Failed to load restaurant:', err)
        setError(err.response?.data?.detail || 'Failed to load restaurant.')
      } finally {
        setLoadingRestaurant(false)
      }
    }

    const loadReviews = async () => {
      try {
        const res = await api.get(`/restaurants/${id}/reviews`)
        const reviewList = Array.isArray(res.data) ? res.data : []
        setReviewsState(reviewList)
        dispatch(setReviews(reviewList))
      } catch (err) {
        console.error('Failed to load reviews:', err)
        setReviewsState([])
        dispatch(setReviews([]))
      } finally {
        setLoadingReviews(false)
      }
    }

    if (id) {
      loadRestaurant()
      loadReviews()
    }

    return () => {
      dispatch(clearSelectedRestaurant())
      dispatch(clearReviews())
    }
  }, [id, dispatch])

  const handleClaimRestaurant = async () => {
    try {
      setClaiming(true)
      const res = await claimRestaurant(restaurant.id)
      setRestaurant(res.data)
      dispatch(setSelectedRestaurant(res.data))
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to claim restaurant.')
    } finally {
      setClaiming(false)
    }
  }

  const amenities = useMemo(() => {
    if (!restaurant?.amenities) return []
    return String(restaurant.amenities)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }, [restaurant])

  if (loadingRestaurant) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader />
        <main className="max-w-6xl mx-auto px-4 py-10">
          <p className="text-gray-500">Loading restaurant details...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader />
        <main className="max-w-6xl mx-auto px-4 py-10">
          <div className="border border-red-200 bg-red-50 rounded-xl p-6">
            <p className="text-red-700 font-medium">{error || 'Restaurant not found.'}</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:underline">
            Home
          </Link>{' '}
          / {restaurant.name}
        </p>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          <div>
            <div className="h-72 md:h-96 rounded-2xl overflow-hidden mb-6 bg-gray-100">
              <img
                src={getRestaurantImage(restaurant)}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-3">{restaurant.name}</h1>

              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Stars rating={restaurant.avg_rating} size="text-lg" />
                <span className="font-semibold text-gray-800">
                  {(Number(restaurant.avg_rating) || 0).toFixed(1)}
                </span>
                <span className="text-gray-500">
                  ({restaurant.review_count || 0} reviews)
                </span>
                {restaurant.pricing_tier && (
                  <span className="text-gray-700">{restaurant.pricing_tier}</span>
                )}
                {restaurant.cuisine_type && (
                  <span className="text-gray-700">{restaurant.cuisine_type}</span>
                )}
              </div>

              <p className="text-gray-700">
                {[restaurant.address, restaurant.city, restaurant.zip_code]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>

            <div className="flex gap-3 mb-8 flex-wrap">
              <Link
                to={`/restaurants/${restaurant.id}/write-review`}
                className="bg-[#d32323] hover:bg-red-700 text-white px-5 py-3 rounded-lg font-semibold"
              >
                Write a Review
              </Link>

              {user && !restaurant.owner_user_id && (
                <button
                  onClick={handleClaimRestaurant}
                  disabled={claiming}
                  className="border border-gray-300 hover:bg-gray-50 text-gray-800 px-5 py-3 rounded-lg font-semibold"
                >
                  {claiming ? 'Claiming...' : 'Own this restaurant?'}
                </button>
              )}

              {user && restaurant.owner_user_id === user.id && (
                <span className="px-5 py-3 rounded-lg bg-green-100 text-green-700 font-semibold">
                  You own this restaurant
                </span>
              )}
            </div>

            <section className="border border-gray-200 rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-semibold mb-4">About</h2>
              <p className="text-gray-700 leading-7">
                {restaurant.description || 'No description available yet.'}
              </p>
            </section>

            <section className="border border-gray-200 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold mb-4">Reviews</h2>

              {loadingReviews ? (
                <p className="text-gray-500">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-gray-500">No reviews yet. Be the first to write one.</p>
              ) : (
                <div className="space-y-5">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border border-gray-200 rounded-xl p-5 bg-white"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {review.user_name || `User #${review.user_id}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(review.created_at)}
                          </p>
                        </div>

                        <Stars rating={review.rating} />
                      </div>

                      <p className="text-gray-700 leading-7">
                        {review.comment || 'No comment provided.'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <div className="border border-gray-200 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4">Business Info</h3>

              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <span className="font-semibold">Hours:</span>{' '}
                  {restaurant.hours || 'Not available'}
                </div>
                <div>
                  <span className="font-semibold">Phone:</span>{' '}
                  {restaurant.contact_phone || 'Not available'}
                </div>
                <div>
                  <span className="font-semibold">Email:</span>{' '}
                  {restaurant.contact_email || 'Not available'}
                </div>
                <div>
                  <span className="font-semibold">City:</span>{' '}
                  {restaurant.city || 'Not available'}
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4">Amenities</h3>

              {amenities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {amenities.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No amenities listed.</p>
              )}
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}