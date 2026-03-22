import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import yelpLogo from '../../assets/yelp_logo.svg'
import { getRestaurant } from '../../services/restaurantService'
import { createReview } from '../../services/reviewService'

const RATING_LABELS = ['', 'Eek! Methinks not.', "Meh. I've experienced better.", 'A-OK.', 'Yay! I\'m a fan.', 'Woohoo! As good as it gets!']

function StarSelector({ rating, onRate }) {
  const [hovered, setHovered] = useState(0)
  const active = (star) => star <= (hovered || rating)
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onRate(star)}
          className={`w-14 h-14 rounded-lg flex items-center justify-center transition-colors focus:outline-none ${active(star) ? 'bg-[#d32323]' : 'bg-gray-300'}`}
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function WriteReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [restaurant, setRestaurant] = useState(null)
  const [rating, setRating]         = useState(0)
  const [review, setReview]         = useState('')
  const [photos, setPhotos]         = useState([])
  const [dragging, setDragging]     = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (id) getRestaurant(id).then(r => setRestaurant(r.data)).catch(() => {})
  }, [id])

  const MIN_CHARS = 85
  const charsLeft = Math.max(0, MIN_CHARS - review.length)
  const metMin    = review.length >= MIN_CHARS

  const handleFiles = (files) => {
    const urls = Array.from(files)
      .filter((f) => f.type.startsWith('image/') || f.type.startsWith('video/'))
      .map((f) => ({ url: URL.createObjectURL(f), name: f.name, type: f.type }))
    setPhotos((prev) => [...prev, ...urls])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0 || !metMin) return
    setSubmitting(true)
    setSubmitError('')
    try {
      await createReview(id, { rating, comment: review })
      navigate(`/restaurants/${id}`)
    } catch (err) {
      setSubmitError(err.response?.data?.detail || 'Failed to post review. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Minimal Header ─────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-14 py-5">
          <Link to="/">
            <img src={yelpLogo} alt="Yelp" className="h-12 w-auto" />
          </Link>
          <Link to="/profile">
            <div className="w-11 h-11 rounded-full bg-gray-300 border-2 border-gray-400 flex items-center justify-center hover:opacity-80 overflow-hidden">
              <svg className="w-7 h-7 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
          </Link>
        </div>
      </header>

      {/* ── Centered Form ──────────────────────────────────── */}
      <div className="flex-1 flex justify-center py-12 px-6">
        <form onSubmit={handleSubmit} className="w-full max-w-4xl">

          {/* Restaurant info */}
          <div className="flex items-center gap-5 mb-6">
            {/* Restaurant photo placeholder */}
            <div className="w-20 h-20 rounded-xl bg-amber-100 shrink-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
              </svg>
            </div>
            <div>
              <h1 className="yelp-h4 text-gray-900">{restaurant?.name || '…'}</h1>
              <p className="yelp-b3 text-gray-500 mt-0.5">{[restaurant?.city, restaurant?.state].filter(Boolean).join(', ')}</p>
            </div>
          </div>

          <hr className="border-gray-200 mb-8" />

          {/* Star rating */}
          <div className="mb-8">
            <p className="yelp-b1-bold text-gray-900 mb-4">How would you rate your experience?</p>
            <div className="flex items-center gap-5">
              <StarSelector rating={rating} onRate={setRating} />
              <span className={`yelp-b2 transition-colors ${rating > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                {rating > 0 ? RATING_LABELS[rating] : 'Select your rating'}
              </span>
            </div>
          </div>

          {/* Review text */}
          <div className="mb-6">
            <p className="yelp-b1-bold text-gray-900 mb-1">Tell us about your experience</p>
            <p className="yelp-b3 text-gray-500 mb-4">A few things to consider in your review</p>

            {/* Consideration tiles */}
            <div className="flex gap-3 mb-5">
              {['Food', 'Service', 'Ambiance'].map((tag) => (
                <div key={tag} className="bg-gray-100 rounded-xl px-6 py-3 yelp-b2 text-gray-600">
                  {tag}
                </div>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Start your review…"
              rows={7}
              className="w-full border border-gray-400 rounded-xl px-5 py-4 yelp-b2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#d32323] focus:ring-1 focus:ring-[#d32323] resize-none"
            />

            {/* Character hint — hides once met */}
            {!metMin && (
              <p className="yelp-b3 text-gray-500 mt-2">
                Reviews need to be at least {MIN_CHARS} characters.
                {review.length > 0 && (
                  <span className="ml-1 text-gray-400">({charsLeft} more to go)</span>
                )}
              </p>
            )}
          </div>

          {/* Photo / video upload */}
          <div className="mb-8">
            <p className="yelp-b1-bold text-gray-900 mb-3">Attach photos and videos</p>

            {/* Previews */}
            {photos.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-3">
                {photos.map((p, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    {p.type.startsWith('image/') ? (
                      <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                        </svg>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 rounded-full text-white text-xs flex items-center justify-center hover:bg-black/80"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl px-6 py-10 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${dragging ? 'border-[#d32323] bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-white'}`}
            >
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="yelp-b2 text-gray-500">Drop photos/videos here or click to browse</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* Submit */}
          {submitError && <p className="yelp-b3 text-red-600 mb-3">{submitError}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="px-10 py-3 rounded-full yelp-b1-bold bg-[#d32323] text-white hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {submitting ? 'Posting…' : 'Post Review'}
          </button>

        </form>
      </div>

    </div>
  )
}
