import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import PageHeader from '../../components/layout/PageHeader'
import Footer from '../../components/layout/Footer'

// Fix default Leaflet marker icon broken by bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Click handler inside the map to move the marker
function LocationPicker({ position, setPosition }) {
  useMapEvents({ click: (e) => setPosition([e.latlng.lat, e.latlng.lng]) })
  return position ? <Marker position={position} /> : null
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

const CATEGORIES = [
  'Pizza','Burgers','Sushi','Mexican','Chinese','Italian','Thai','Indian',
  'Mediterranean','American','BBQ','Seafood','Vegetarian','Vegan','Bakery',
  'Coffee & Tea','Bars','Nightlife','Fast Food','Sandwiches','Salads',
  'Breakfast & Brunch','Desserts','Steakhouses','French','Korean','Vietnamese',
]

function StarSelector({ rating, onRate }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onRate(star)}
          className="focus:outline-none"
        >
          <svg
            className={`w-9 h-9 transition-colors ${star <= (hovered || rating) ? 'text-[#d32323]' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

export default function AddRestaurant() {
  const navigate = useNavigate()

  // Default map center: San Francisco
  const [mapPosition, setMapPosition] = useState([37.7749, -122.4194])

  const [form, setForm] = useState({
    country: 'United States',
    businessName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    phone: '',
    website: '',
    categories: [],
    openingSoon: false,
    writeReview: true,
    rating: 0,
    review: '',
  })

  const [categoryInput, setCategoryInput]   = useState('')
  const [showCatDropdown, setShowCatDropdown] = useState(false)

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const addCategory = (cat) => {
    if (form.categories.length >= 3 || form.categories.includes(cat)) return
    set('categories', [...form.categories, cat])
    setCategoryInput('')
    setShowCatDropdown(false)
  }

  const removeCategory = (cat) => set('categories', form.categories.filter((c) => c !== cat))

  const filteredCats = CATEGORIES.filter(
    (c) => c.toLowerCase().includes(categoryInput.toLowerCase()) && !form.categories.includes(c)
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: wire to backend
    alert('Business submitted for review!')
    navigate('/')
  }

  const inputCls = 'w-full border border-gray-500 rounded-lg px-4 py-3 yelp-b2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#d32323] focus:ring-1 focus:ring-[#d32323]'
  const labelCls = 'block yelp-b2-bold text-gray-800 mb-1.5'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PageHeader variant="light" showProfileNav />

      {/* Page content — two columns: form left, map right */}
      <div className="flex-1 flex gap-10 w-full pl-[14.5rem] pr-16 py-10 justify-between">

        {/* ── LEFT: form column ── */}
        <div className="flex-1 max-w-[620px]">

        {/* Title */}
        <h1 className="yelp-h3 text-[#d32323] font-bold mb-3">Add a Business</h1>
        <p className="yelp-b3 text-gray-800 mb-8 whitespace-nowrap">
          Please note: This business page will not appear in search results until it has been approved by our moderators.
        </p>

        <form onSubmit={handleSubmit} className="space-y-7">

          {/* Country */}
          <div>
            <label className={labelCls}>Country</label>
            <select
              value={form.country}
              onChange={(e) => set('country', e.target.value)}
              className={inputCls + ' bg-white'}
            >
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Australia</option>
              <option>Other</option>
            </select>
          </div>

          {/* Business Name */}
          <div>
            <label className={labelCls}>Business Name</label>
            <input
              type="text"
              value={form.businessName}
              onChange={(e) => set('businessName', e.target.value)}
              placeholder="Mel's Diner"
              className={inputCls}
            />
          </div>

          {/* Address */}
          <div>
            <label className={labelCls}>Address</label>
            <div className="space-y-3">
              <input
                type="text"
                value={form.address1}
                onChange={(e) => set('address1', e.target.value)}
                placeholder="123 Main St"
                className={inputCls}
              />
              <input
                type="text"
                value={form.address2}
                onChange={(e) => set('address2', e.target.value)}
                placeholder="Suite, Floor, Unit (optional)"
                className={inputCls}
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className={labelCls}>City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="San Francisco"
              className={inputCls}
            />
          </div>

          {/* State */}
          <div>
            <label className={labelCls}>State</label>
            <select
              value={form.state}
              onChange={(e) => set('state', e.target.value)}
              className={inputCls + ' bg-white'}
            >
              <option value="">CA</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* ZIP */}
          <div>
            <label className={labelCls}>ZIP</label>
            <input
              type="text"
              value={form.zip}
              onChange={(e) => set('zip', e.target.value)}
              placeholder="94103"
              className={inputCls}
            />
          </div>

          {/* Phone */}
          <div>
            <label className={labelCls}>Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="(555) 555-5555"
              className={inputCls}
            />
          </div>

          {/* Website */}
          <div>
            <label className={labelCls}>Website Address</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => set('website', e.target.value)}
              placeholder="http://www.companyaddress.com"
              className={inputCls}
            />
          </div>

          {/* Categories */}
          <div>
            <label className={labelCls}>Categories</label>
            <p className="yelp-b3 text-gray-500 mb-2">Select up to 3 categories. The more specific the better.</p>

            {/* Selected tags */}
            {form.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {form.categories.map((cat) => (
                  <span key={cat} className="flex items-center gap-1.5 bg-red-50 border border-[#d32323] text-[#d32323] yelp-b3 px-3 py-1 rounded-full">
                    {cat}
                    <button type="button" onClick={() => removeCategory(cat)} className="hover:text-red-700 font-bold leading-none">×</button>
                  </span>
                ))}
              </div>
            )}

            {/* Input + dropdown */}
            <div className="relative">
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => { setCategoryInput(e.target.value); setShowCatDropdown(true) }}
                onFocus={() => setShowCatDropdown(true)}
                onBlur={() => setTimeout(() => setShowCatDropdown(false), 150)}
                placeholder={form.categories.length >= 3 ? 'Max 3 categories selected' : 'Pizza'}
                disabled={form.categories.length >= 3}
                className={inputCls + (form.categories.length >= 3 ? ' opacity-50 cursor-not-allowed' : '')}
              />
              {showCatDropdown && filteredCats.length > 0 && form.categories.length < 3 && (
                <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                  {filteredCats.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onMouseDown={() => addCategory(cat)}
                      className="block w-full text-left px-4 py-2.5 yelp-b2 text-gray-700 hover:bg-gray-50"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.openingSoon}
                onChange={(e) => set('openingSoon', e.target.checked)}
                className="accent-[#d32323] w-5 h-5 mt-0.5 shrink-0 cursor-pointer"
              />
              <span className="yelp-b2 text-gray-800">This business recently opened or is opening soon</span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.writeReview}
                onChange={(e) => set('writeReview', e.target.checked)}
                className="accent-[#d32323] w-5 h-5 mt-0.5 shrink-0 cursor-pointer"
              />
              <span className="yelp-b2 text-gray-800">Write a review for this business</span>
            </label>
          </div>

          {/* Review box — shown when writeReview is checked */}
          {form.writeReview && (
            <div className="border border-yellow-400 bg-yellow-50 rounded-xl overflow-hidden">
              {/* Rating row */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-yellow-400">
                <div className="flex items-center gap-3">
                  <StarSelector rating={form.rating} onRate={(r) => set('rating', r)} />
                  <span className="yelp-b2 text-gray-600">
                    {form.rating === 0 ? 'Select your rating.' : ['','Eek! Methinks not.','Meh. I\'ve experienced better.','A-OK.','Yay! I\'m a fan.','Woohoo! As good as it gets!'][form.rating]}
                  </span>
                </div>
                <button type="button" className="yelp-b3 text-blue-600 hover:underline whitespace-nowrap shrink-0">
                  Read our review guidelines
                </button>
              </div>
              {/* Review text */}
              <textarea
                value={form.review}
                onChange={(e) => set('review', e.target.value)}
                placeholder="Start your review…"
                rows={5}
                className="w-full bg-yellow-50 px-5 py-4 yelp-b2 text-gray-800 placeholder-gray-400 focus:outline-none resize-none"
              />
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="bg-[#d32323] text-white rounded-lg px-8 py-3 yelp-b2-bold hover:bg-red-700 transition-colors"
          >
            Add Business
          </button>

        </form>
        </div>{/* end form column */}

        {/* ── RIGHT: map column ── */}
        <div className="shrink-0 pt-[88px] mr-40">
          <p className="yelp-b3 text-gray-500 mb-2">Click map to pin location</p>
          <div className="w-[307px] h-[307px] rounded-xl overflow-hidden border border-gray-300 shadow-sm">
            <MapContainer
              center={mapPosition}
              zoom={13}
              style={{ width: '100%', height: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <LocationPicker position={mapPosition} setPosition={setMapPosition} />
            </MapContainer>
          </div>
        </div>

      </div>{/* end two-column flex */}

      <Footer />
    </div>
  )
}
