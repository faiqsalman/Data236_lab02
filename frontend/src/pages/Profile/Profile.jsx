import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getUserHistory, updateMe } from '../../services/userService'

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

function formatDate(dateString) {
  if (!dateString) return 'Recently'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return date.toLocaleDateString()
}

function formatYelpingSince(dateString) {
  if (!dateString) return 'Recently'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      <p className="text-gray-600 mt-1">{value || 'Not added yet'}</p>
    </div>
  )
}

export default function Profile() {
  const { user, refreshUser } = useAuth()

  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [history, setHistory] = useState({
    reviews: [],
    restaurants_added: [],
    restaurants_owned: [],
  })

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    about_me: '',
    city: '',
    state: '',
    country: '',
    languages: '',
    gender: '',
  })

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        about_me: user.about_me || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        languages: user.languages || '',
        gender: user.gender || '',
      })
    }
  }, [user])

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await getUserHistory()
        setHistory({
          reviews: res.data.reviews || [],
          restaurants_added: res.data.restaurants_added || [],
          restaurants_owned: res.data.restaurants_owned || [],
        })
      } catch (err) {
        console.error('Failed to load profile history:', err)
        setError(err.response?.data?.detail || 'Failed to load profile data.')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  const locationText = useMemo(() => {
    return [user?.city, user?.state, user?.country].filter(Boolean).join(', ') || 'Add your location'
  }, [user])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setSuccess('')
    setError('')
  }

  const handleCancelEdit = () => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        about_me: user.about_me || '',
        city: user.city || '',
        state: user.state || '',
        country: user.country || '',
        languages: user.languages || '',
        gender: user.gender || '',
      })
    }
    setIsEditing(false)
    setSuccess('')
    setError('')
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await updateMe(form)
      await refreshUser()
      setSuccess('Profile updated successfully.')
      setIsEditing(false)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-[320px_1fr] gap-8">
        <aside>
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="w-40 h-40 rounded-full bg-gray-100 mx-auto flex items-center justify-center overflow-hidden">
              {user?.profile_pic_url ? (
                <img
                  src={user.profile_pic_url}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-24 h-24 text-gray-300"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                  <path d="M4 20a8 8 0 1 1 16 0" />
                </svg>
              )}
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mt-6">
              {user?.name || 'My Profile'}
            </h1>

            <p className="text-gray-600 mt-3 text-xl">
              {locationText}
            </p>

            <div className="flex items-center justify-center gap-10 mt-10">
              <button
                onClick={handleEditClick}
                className="flex flex-col items-center text-gray-700 hover:text-[#d32323]"
              >
                <div className="w-14 h-14 rounded-full border border-gray-300 flex items-center justify-center mb-2 text-2xl">
                  ✎
                </div>
                <span className="text-sm">Edit profile</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center text-gray-700 opacity-60 cursor-not-allowed"
              >
                <div className="w-14 h-14 rounded-full border border-gray-300 flex items-center justify-center mb-2 text-2xl">
                  ⊕
                </div>
                <span className="text-sm">Add photo</span>
              </button>

              <button
                type="button"
                className="flex flex-col items-center text-gray-700 opacity-60 cursor-not-allowed"
              >
                <div className="w-14 h-14 rounded-full border border-gray-300 flex items-center justify-center mb-2 text-2xl">
                  👤
                </div>
                <span className="text-sm">Add friends</span>
              </button>
            </div>
          </div>

          <div className="mt-8 bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-6 py-5 text-left border-b ${
                activeTab === 'overview' ? 'bg-gray-100 font-semibold' : 'bg-white'
              }`}
            >
              <span className="text-xl">◎</span>
              <span>Profile overview</span>
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full flex items-center gap-3 px-6 py-5 text-left border-b ${
                activeTab === 'reviews' ? 'bg-gray-100 font-semibold' : 'bg-white'
              }`}
            >
              <span className="text-xl">★</span>
              <span>Reviews</span>
            </button>

            <button
              onClick={() => setActiveTab('owned')}
              className={`w-full flex items-center gap-3 px-6 py-5 text-left ${
                activeTab === 'owned' ? 'bg-gray-100 font-semibold' : 'bg-white'
              }`}
            >
              <span className="text-xl">⌂</span>
              <span>Owned restaurants</span>
            </button>
          </div>
        </aside>

        <section>

          {error && (
            <div className="mb-4 rounded-lg bg-red-100 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-lg bg-green-100 text-green-700 px-4 py-3 text-sm">
              {success}
            </div>
          )}

          {activeTab === 'overview' && (
            <>
              {isEditing ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-8">
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">Edit profile</h2>

                  <form onSubmit={handleSaveProfile} className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Phone</label>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Gender</label>
                      <input
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">City</label>
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">State</label>
                      <input
                        name="state"
                        value={form.state}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Country</label>
                      <input
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-3"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Languages</label>
                      <input
                        name="languages"
                        value={form.languages}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-3"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block mb-1 text-sm font-medium text-gray-700">About Me</label>
                      <textarea
                        name="about_me"
                        value={form.about_me}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-3 min-h-[120px]"
                      />
                    </div>

                    <div className="md:col-span-2 flex gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#d32323] hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
                      >
                        {saving ? 'Saving...' : 'Save changes'}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="border border-gray-300 hover:bg-gray-50 px-6 py-3 rounded-lg font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  <h2 className="text-5xl font-bold text-gray-900 mb-6">More about me</h2>

                  <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8 grid md:grid-cols-2 gap-8">
                    <Field label="Location" value={locationText} />
                    <Field label="Yelping since" value={formatYelpingSince(user?.created_at)} />
                    <Field label="Phone" value={user?.phone} />
                    <Field label="Email" value={user?.email} />
                    <Field label="Languages" value={user?.languages} />
                    <Field label="Gender" value={user?.gender} />
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">About me</h3>
                    <p className="text-gray-700 leading-8">
                      {user?.about_me || 'Tell people more about yourself by editing your profile.'}
                    </p>
                  </div>
                </>
              )}
            </>
          )}

          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-4xl font-bold text-gray-900">My reviews</h2>
                <span className="text-sm text-gray-500">{history.reviews.length} total</span>
              </div>

              {loading ? (
                <p className="text-gray-500">Loading reviews...</p>
              ) : history.reviews.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-600">
                  You have not written any reviews yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {history.reviews.map((review) => (
                    <div key={review.id} className="bg-white border border-gray-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div>
                          <Link
                            to={`/restaurants/${review.restaurant_id}`}
                            className="font-semibold text-[#d32323] hover:underline"
                          >
                            View Restaurant
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
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
            </div>
          )}

          {activeTab === 'owned' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-4xl font-bold text-gray-900">Restaurants I own</h2>
                <span className="text-sm text-gray-500">{history.restaurants_owned.length} total</span>
              </div>

              {loading ? (
                <p className="text-gray-500">Loading restaurants...</p>
              ) : history.restaurants_owned.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-600">
                  You do not own any restaurants yet.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {history.restaurants_owned.map((restaurant) => (
                    <Link
                      key={restaurant.id}
                      to={`/restaurants/${restaurant.id}`}
                      className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition"
                    >
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

                      <p className="text-sm text-gray-600">
                        {[restaurant.cuisine_type, restaurant.city].filter(Boolean).join(' · ')}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}