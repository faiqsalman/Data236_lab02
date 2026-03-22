import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Footer from '../../components/layout/Footer'
import { getProfile, updateProfile, getPreferences, updatePreferences, getFavorites, getHistory } from '../../services/userService'

/* ─────────────────────────── constants ─────────────────────────── */
const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV',
  'NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN',
  'TX','UT','VT','VA','WA','WV','WI','WY',
]

const COUNTRIES = [
  'United States','Canada','United Kingdom','Australia','France','Germany',
  'Japan','South Korea','Mexico','Brazil','India','China','Italy','Spain',
  'Netherlands','Sweden','Switzerland','New Zealand','Singapore','Other',
]

const LANGUAGES = [
  'English','Spanish','French','Mandarin','Cantonese','Japanese','Korean',
  'Portuguese','German','Italian','Arabic','Hindi','Vietnamese','Tagalog',
  'Russian','Polish','Dutch','Swedish','Other',
]

const GENDERS = ['Prefer not to say','Man','Woman','Non-binary','Transgender','Gender fluid','Other']

/* ─────────────────────────── EditProfileModal ───────────────────── */
function EditProfileModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({
    name:      user.name      || '',
    email:     user.email     || '',
    phone:     user.phone     || '',
    aboutMe:   user.aboutMe   || '',
    city:      user.city      || '',
    state:     user.state     || '',
    country:   user.country   || 'United States',
    languages: user.languages || [],
    gender:    user.gender    || 'Prefer not to say',
  })

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const toggleLanguage = (lang) =>
    set('languages', form.languages.includes(lang)
      ? form.languages.filter((l) => l !== lang)
      : [...form.languages, lang])

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
    onClose()
  }

  const inputCls = 'w-full border border-gray-400 rounded-lg px-4 py-2.5 yelp-b3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#d32323] focus:ring-1 focus:ring-[#d32323] bg-white'
  const labelCls = 'block yelp-b3-bold text-gray-700 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-gray-200">
          <h2 className="yelp-b1-bold text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">✕</button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-7 py-6 space-y-5">

          {/* Name */}
          <div>
            <label className={labelCls}>Name</label>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)}
              placeholder="Your name" className={inputCls} />
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
              placeholder="you@example.com" className={inputCls} />
          </div>

          {/* Phone */}
          <div>
            <label className={labelCls}>Phone Number</label>
            <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)}
              placeholder="(555) 555-5555" className={inputCls} />
          </div>

          {/* About Me */}
          <div>
            <label className={labelCls}>About Me</label>
            <textarea value={form.aboutMe} onChange={(e) => set('aboutMe', e.target.value)}
              placeholder="Tell the Yelp community about yourself…" rows={3}
              className={inputCls + ' resize-none'} />
          </div>

          {/* City */}
          <div>
            <label className={labelCls}>City</label>
            <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)}
              placeholder="San Francisco" className={inputCls} />
          </div>

          {/* State */}
          <div>
            <label className={labelCls}>State</label>
            <select value={form.state} onChange={(e) => set('state', e.target.value)} className={inputCls}>
              <option value="">Select state</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Country */}
          <div>
            <label className={labelCls}>Country</label>
            <select value={form.country} onChange={(e) => set('country', e.target.value)} className={inputCls}>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Languages */}
          <div>
            <label className={labelCls}>Languages</label>
            <p className="yelp-b4 text-gray-500 mb-2">Select all that apply</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const selected = form.languages.includes(lang)
                return (
                  <button key={lang} type="button" onClick={() => toggleLanguage(lang)}
                    className={`yelp-b4 px-3 py-1.5 rounded-full border transition-colors ${
                      selected ? 'bg-[#d32323] border-[#d32323] text-white' : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}>
                    {lang}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className={labelCls}>Gender</label>
            <select value={form.gender} onChange={(e) => set('gender', e.target.value)} className={inputCls}>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-gray-200 flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 border border-gray-300 rounded-lg py-2.5 yelp-b3-semi text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit}
            className="flex-1 bg-[#d32323] text-white rounded-lg py-2.5 yelp-b3-semi hover:bg-red-700">
            Save Changes
          </button>
        </div>

      </div>
    </div>
  )
}

/* ─────────────────────────── mock data ─────────────────────────── */
const MOCK_USER = {
  name: 'Alex Johnson',
  location: 'San Francisco, CA',
  yelpingSince: 'January 2022',
}

const MY_COLLECTIONS = [
  {
    id: 1, title: 'Weekend Brunch Spots', count: 12, isPublic: true,
    photo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop',
  },
  {
    id: 2, title: 'Late Night Eats', count: 7, isPublic: false,
    photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=300&fit=crop',
  },
  {
    id: 3, title: 'Hidden Gems', count: 15, isPublic: true,
    photo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=300&fit=crop',
  },
]

const FEATURED_COLLECTIONS = [
  {
    id: 1, title: 'Best Pizza in SF', by: 'YelpSF', count: 10,
    photo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&h=300&fit=crop',
  },
  {
    id: 2, title: 'Rooftop Bars', by: 'DiscoverSF', count: 8,
    photo: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=300&h=300&fit=crop',
  },
  {
    id: 3, title: 'Coffee Crawl', by: 'CoffeeLover', count: 14,
    photo: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop',
  },
]

const DISCOVER_GROUPS = [
  {
    label: 'Good for Brunch',
    tiles: [
      { id: 1, title: 'Brunch Club', by: 'BrunchKing', count: 9, photo: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=300&h=300&fit=crop' },
      { id: 2, title: 'Eggs & More', by: 'MorningPerson', count: 6, photo: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=300&h=300&fit=crop' },
      { id: 3, title: 'Sunday Funday', by: 'WeekendVibes', count: 11, photo: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=300&h=300&fit=crop' },
    ],
  },
  {
    label: 'Coffee & Tea',
    tiles: [
      { id: 4, title: 'Caffeine Fix', by: 'CoffeeNerd', count: 13, photo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=300&fit=crop' },
      { id: 5, title: 'Tea Time', by: 'TeaLover', count: 5, photo: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=300&fit=crop' },
      { id: 6, title: 'Cozy Cafes', by: 'BookWorm', count: 8, photo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300&h=300&fit=crop' },
    ],
  },
  {
    label: 'Desserts',
    tiles: [
      { id: 7, title: 'Sweet Tooth', by: 'DessertQueen', count: 17, photo: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&h=300&fit=crop' },
      { id: 8, title: 'Ice Cream Trail', by: 'FrozenFan', count: 7, photo: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=300&h=300&fit=crop' },
      { id: 9, title: 'Bakery Gems', by: 'PastryChef', count: 10, photo: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=300&h=300&fit=crop' },
    ],
  },
]

/* ─────────────────────────── sub-components ─────────────────────── */

function AvatarCircle({ size = 'lg' }) {
  const dim = size === 'lg' ? 'w-24 h-24' : 'w-10 h-10'
  const iconDim = size === 'lg' ? 'w-14 h-14' : 'w-6 h-6'
  return (
    <div className={`${dim} rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center mx-auto`}>
      <svg className={`${iconDim} text-gray-400`} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    </div>
  )
}

function CollectionTile({ photo, title, by, count, isPublic }) {
  return (
    <div className="w-52 shrink-0">
      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-200">
        <img src={photo} alt={title} className="w-full h-full object-cover" />
        <div className="absolute bottom-2 right-2 bg-white/80 rounded px-2 py-0.5 flex items-center gap-1">
          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z" />
          </svg>
          <span className="yelp-b4 text-gray-700 font-semibold">{count}</span>
        </div>
      </div>
      <p className="yelp-b3-bold text-gray-900 mt-2 leading-tight">{title}</p>
      {by !== undefined && (
        <p className="yelp-b4 text-gray-500 mt-0.5">By {by}</p>
      )}
      {isPublic !== undefined && (
        <p className="yelp-b4 text-gray-500 mt-0.5">{isPublic ? 'Public' : 'Non-Public'}</p>
      )}
    </div>
  )
}

/* ─────────────────────────── section panels ─────────────────────── */

function ProfileOverviewPanel({ user }) {
  return (
    <div>
      <p className="yelp-b1-bold text-gray-900 mb-4">More about me</p>
      <div className="border border-gray-200 rounded-lg px-5 py-4 flex gap-10">
        <div>
          <p className="yelp-b3-semi text-gray-500 mb-1">Location</p>
          <p className="yelp-b3 text-gray-800">{user.location || 'Not set'}</p>
        </div>
        <div>
          <p className="yelp-b3-semi text-gray-500 mb-1">Yelping since</p>
          <p className="yelp-b3 text-gray-800">{user.yelpingSince || 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}

function ReviewsPanel() {
  return (
    <div>
      <p className="yelp-b1-bold text-gray-900 mb-4">Reviews</p>
      <div className="border border-gray-200 rounded-lg p-6 text-center">
        <p className="yelp-b2-bold text-gray-900 mb-3">It's your turn</p>
        <p className="yelp-b3 text-gray-500 max-w-md mx-auto mb-5">
          Review everything from your favorite burger to your favorite root canal.
          Write reviews to contribute to the Yelp community and help your friends
          find all the local gems that you love.
        </p>
        <button className="bg-[#d32323] text-white yelp-b3-semi px-6 py-2.5 rounded-full hover:bg-red-700">
          Write a Review
        </button>
      </div>
    </div>
  )
}

function EventsPanel() {
  return (
    <div>
      <p className="yelp-b1-bold text-[#d32323] mb-0">Events</p>
      <hr className="border-gray-200 mb-5" />
      <p className="yelp-b3 text-gray-600 max-w-lg mb-5">
        There's always lots going on in your city. Use Yelp to explore local
        activities, save cool events, and even create your own! When you come
        back here, it's like your very own social calendar.
      </p>
      <button className="bg-[#d32323] text-white yelp-b3-semi px-6 py-2.5 rounded hover:bg-red-700">
        Discover Things To Do
      </button>
    </div>
  )
}

/* ─────────────────────────── Collections page ───────────────────── */
function CollectionsPage({ onBack }) {
  const [collectionsTab, setCollectionsTab] = useState('mine')
  const [discoverSearch, setDiscoverSearch] = useState('')

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PageHeader variant="light" showProfileNav />

      {/* Breadcrumb */}
      <div className="px-36 py-3 border-b border-gray-200">
        <p className="yelp-b3 text-gray-500">
          <button onClick={onBack} className="text-[#0073bb] hover:underline">{MOCK_USER.name}</button>
          {' > '}
          <span className="text-gray-700">My Collections</span>
        </p>
      </div>

      {/* Header row */}
      <div className="px-36 pt-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="yelp-h4 text-gray-900">Collections</h1>
          <button className="bg-[#d32323] text-white yelp-b3-semi px-5 py-2.5 rounded hover:bg-red-700">
            Create a Collection
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-8">
          {[
            { key: 'discover', label: 'Discover' },
            { key: 'mine', label: 'My Collections' },
            { key: 'following', label: 'Following Collections' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setCollectionsTab(t.key)}
              className={`yelp-b2-semi pb-3 border-b-2 transition-colors ${
                collectionsTab === t.key
                  ? 'border-[#d32323] text-gray-900'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <hr className="border-gray-200" />
      </div>

      {/* Tab content */}
      <div className="px-36 py-8 flex-1">
        {collectionsTab === 'discover' && (
          <div>
            {/* Location header + search */}
            <div className="flex items-center justify-between mb-6">
              <p className="yelp-b1-bold text-gray-900">Collections in {MOCK_USER.location}</p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex rounded-lg overflow-hidden border border-gray-300 shadow-sm"
              >
                <input
                  type="text"
                  value={discoverSearch}
                  onChange={(e) => setDiscoverSearch(e.target.value)}
                  placeholder={MOCK_USER.location}
                  className="px-4 py-2 yelp-b3 text-gray-700 focus:outline-none w-52"
                />
                <button className="bg-[#d32323] text-white px-4 flex items-center hover:bg-red-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                </button>
              </form>
            </div>

            {/* Featured */}
            <p className="yelp-b2-bold text-gray-900 mb-4">Featured</p>
            <div className="flex gap-5 mb-10">
              {FEATURED_COLLECTIONS.map((c) => (
                <CollectionTile key={c.id} {...c} />
              ))}
            </div>

            {/* Discover groups */}
            {DISCOVER_GROUPS.map((group) => (
              <div key={group.label} className="mb-10">
                <p className="yelp-b2-bold text-gray-900 mb-4">{group.label}</p>
                <div className="flex gap-5">
                  {group.tiles.map((c) => (
                    <CollectionTile key={c.id} {...c} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {collectionsTab === 'mine' && (
          <div>
            <div className="flex gap-5 flex-wrap">
              {MY_COLLECTIONS.map((c) => (
                <CollectionTile key={c.id} {...c} />
              ))}
            </div>
          </div>
        )}

        {collectionsTab === 'following' && (
          <div className="py-12 text-center text-gray-500 yelp-b3 max-w-lg mx-auto">
            You haven't started following collections yet. Follow collections updated
            weekly by Yelp and local collections hand-curated by other Yelpers.
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

/* ─────────────────────────── Preferences panel ─────────────────── */
const CUISINE_OPTIONS = ['American','Italian','Mexican','Chinese','Japanese','Korean','Thai','Indian','Mediterranean','French','Greek','Vietnamese','Other']
const DIETARY_OPTIONS = ['Vegan','Vegetarian','Gluten-Free','Halal','Kosher','Dairy-Free','Nut-Free']
const AMBIANCE_OPTIONS = ['Casual','Romantic','Business','Family-Friendly','Trendy','Quiet','Outdoor','Sports Bar']
const SORT_OPTIONS = ['Rating','Distance','Review Count','Price Low to High','Price High to Low']
const PRICE_OPTIONS = ['$','$$','$$$','$$$$']

function PreferencesPanel() {
  const [prefs, setPrefs] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    getPreferences()
      .then((res) => setPrefs(res.data))
      .catch(() => setError('Log in to manage preferences'))
  }, [])

  const toArr = (str) => (str ? str.split(',').map((s) => s.trim()).filter(Boolean) : [])
  const toStr = (arr) => arr.join(',')

  const toggleItem = (field, item) => {
    const arr = toArr(prefs[field])
    const updated = arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]
    setPrefs((p) => ({ ...p, [field]: toStr(updated) }))
  }

  const handleSave = async () => {
    setSaving(true); setSaved(false); setError(null)
    try {
      const res = await updatePreferences({
        cuisines: prefs.cuisines || null,
        price_range: prefs.price_range || null,
        dietary_needs: prefs.dietary_needs || null,
        ambiance: prefs.ambiance || null,
        sort_by: prefs.sort_by || null,
        preferred_location: prefs.preferred_location || null,
        search_radius_miles: prefs.search_radius_miles ? Number(prefs.search_radius_miles) : null,
      })
      setPrefs(res.data)
      setSaved(true)
    } catch {
      setError('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  if (error) return <p className="yelp-b3 text-gray-500">{error}</p>
  if (!prefs) return <p className="yelp-b3 text-gray-400">Loading…</p>

  const labelCls = 'yelp-b3-bold text-gray-700 mb-2 block'
  const sectionCls = 'mb-6'

  const MultiChip = ({ field, options }) => (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = toArr(prefs[field]).includes(opt)
        return (
          <button key={opt} onClick={() => toggleItem(field, opt)}
            className={`px-3 py-1.5 rounded-full yelp-b3 border transition-colors ${selected ? 'bg-[#d32323] text-white border-[#d32323]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
            {opt}
          </button>
        )
      })}
    </div>
  )

  return (
    <div>
      <p className="yelp-b1-bold text-gray-900 mb-5">My Preferences</p>

      <div className={sectionCls}>
        <label className={labelCls}>Favorite Cuisines</label>
        <MultiChip field="cuisines" options={CUISINE_OPTIONS} />
      </div>

      <div className={sectionCls}>
        <label className={labelCls}>Price Range</label>
        <div className="flex gap-2">
          {PRICE_OPTIONS.map((p) => {
            const selected = toArr(prefs.price_range).includes(p)
            return (
              <button key={p} onClick={() => toggleItem('price_range', p)}
                className={`px-4 py-1.5 rounded-full yelp-b3 border transition-colors ${selected ? 'bg-[#d32323] text-white border-[#d32323]' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                {p}
              </button>
            )
          })}
        </div>
      </div>

      <div className={sectionCls}>
        <label className={labelCls}>Dietary Needs</label>
        <MultiChip field="dietary_needs" options={DIETARY_OPTIONS} />
      </div>

      <div className={sectionCls}>
        <label className={labelCls}>Ambiance</label>
        <MultiChip field="ambiance" options={AMBIANCE_OPTIONS} />
      </div>

      <div className={sectionCls}>
        <label className={labelCls}>Preferred Sort Order</label>
        <select value={prefs.sort_by || ''} onChange={(e) => setPrefs((p) => ({ ...p, sort_by: e.target.value }))}
          className="border border-gray-300 rounded-lg px-3 py-2 yelp-b3 text-gray-700 focus:outline-none focus:border-[#d32323]">
          <option value="">No preference</option>
          {SORT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>

      <div className={sectionCls}>
        <label className={labelCls}>Preferred Location</label>
        <input type="text" value={prefs.preferred_location || ''} onChange={(e) => setPrefs((p) => ({ ...p, preferred_location: e.target.value }))}
          placeholder="e.g. San Francisco, CA"
          className="border border-gray-300 rounded-lg px-3 py-2 yelp-b3 text-gray-700 w-full max-w-xs focus:outline-none focus:border-[#d32323]" />
      </div>

      <div className={sectionCls}>
        <label className={labelCls}>Search Radius (miles)</label>
        <input type="number" min={1} max={100} value={prefs.search_radius_miles || 10} onChange={(e) => setPrefs((p) => ({ ...p, search_radius_miles: e.target.value }))}
          className="border border-gray-300 rounded-lg px-3 py-2 yelp-b3 text-gray-700 w-28 focus:outline-none focus:border-[#d32323]" />
      </div>

      <div className="flex items-center gap-4">
        <button onClick={handleSave} disabled={saving}
          className="bg-[#d32323] text-white yelp-b3-semi px-6 py-2.5 rounded-full hover:bg-red-700 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Preferences'}
        </button>
        {saved && <span className="yelp-b3 text-green-600">Saved!</span>}
        {error && <span className="yelp-b3 text-red-600">{error}</span>}
      </div>
    </div>
  )
}

/* ─────────────────────────── Favorites panel ────────────────────── */
function FavoritesPanel() {
  const [favorites, setFavorites] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getFavorites()
      .then((res) => setFavorites(res.data))
      .catch(() => setError('Log in to view favorites'))
  }, [])

  if (error) return <p className="yelp-b3 text-gray-500">{error}</p>
  if (!favorites) return <p className="yelp-b3 text-gray-400">Loading…</p>

  return (
    <div>
      <p className="yelp-b1-bold text-gray-900 mb-4">My Favorites</p>
      {favorites.length === 0 ? (
        <div className="border border-gray-200 rounded-lg p-6 text-center">
          <p className="yelp-b2-bold text-gray-900 mb-2">No favorites yet</p>
          <p className="yelp-b3 text-gray-500">Save restaurants you love to find them here later.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {favorites.map((r) => (
            <Link key={r.id} to={`/restaurants/${r.id}`} className="flex items-center gap-4 border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 rounded-lg bg-gray-200 shrink-0 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="yelp-b2-bold text-gray-900">{r.name}</p>
                <p className="yelp-b3 text-gray-500">{r.cuisine_type}</p>
                <p className="yelp-b3 text-gray-500">{r.city}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="yelp-b3-semi text-gray-700">{r.avg_rating ? `${r.avg_rating} ★` : '—'}</p>
                <p className="yelp-b4 text-gray-400">{r.review_count ?? 0} reviews</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────── History panel ──────────────────────── */
function HistoryPanel() {
  const [history, setHistory] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getHistory()
      .then((res) => setHistory(res.data))
      .catch(() => setError('Log in to view your history'))
  }, [])

  if (error) return <p className="yelp-b3 text-gray-500">{error}</p>
  if (!history) return <p className="yelp-b3 text-gray-400">Loading…</p>

  const { reviews = [], restaurants_added = [] } = history

  return (
    <div>
      <p className="yelp-b1-bold text-gray-900 mb-4">My Activity</p>

      <p className="yelp-b2-bold text-gray-800 mb-3">Reviews Written ({reviews.length})</p>
      {reviews.length === 0 ? (
        <p className="yelp-b3 text-gray-500 mb-6">No reviews yet.</p>
      ) : (
        <div className="flex flex-col gap-3 mb-7">
          {reviews.map((rev) => (
            <Link key={rev.id} to={`/restaurants/${rev.restaurant_id}`} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                <span className="yelp-b3-semi text-[#d32323]">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                <span className="yelp-b4 text-gray-400">{new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <p className="yelp-b3 text-gray-700 line-clamp-2">{rev.comment}</p>
            </Link>
          ))}
        </div>
      )}

      <p className="yelp-b2-bold text-gray-800 mb-3">Restaurants Added ({restaurants_added.length})</p>
      {restaurants_added.length === 0 ? (
        <p className="yelp-b3 text-gray-500">No restaurants added yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {restaurants_added.map((r) => (
            <Link key={r.id} to={`/restaurants/${r.id}`} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <p className="yelp-b3-semi text-gray-900">{r.name}</p>
              <p className="yelp-b4 text-gray-500">{r.cuisine_type} · {r.city}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────── main component ─────────────────────── */
const SECTIONS = [
  {
    key: 'overview',
    label: 'Profile Overview',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    ),
  },
  {
    key: 'reviews',
    label: 'Reviews',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    ),
  },
  {
    key: 'collections',
    label: 'Collections',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z" />
      </svg>
    ),
  },
  {
    key: 'events',
    label: 'Events',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2h-1V1h-2zm3 18H5V8h14v11z" />
      </svg>
    ),
  },
  {
    key: 'preferences',
    label: 'Preferences',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
  {
    key: 'favorites',
    label: 'Favorites',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
  },
  {
    key: 'history',
    label: 'History',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

export default function Profile() {
  const [activeSection, setActiveSection]   = useState('overview')
  const [showCollections, setShowCollections] = useState(false)
  const [showEditModal, setShowEditModal]   = useState(false)
  const [user, setUser] = useState({
    ...MOCK_USER,
    email: '', phone: '', aboutMe: '', city: 'San Francisco',
    state: 'CA', country: 'United States', languages: ['English'], gender: 'Prefer not to say',
  })

  useEffect(() => {
    getProfile()
      .then((res) => {
        const u = res.data
        const since = u.created_at
          ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          : MOCK_USER.yelpingSince
        setUser({
          name:        u.name      || MOCK_USER.name,
          location:    [u.city, u.state].filter(Boolean).join(', ') || MOCK_USER.location,
          yelpingSince: since,
          email:       u.email     || '',
          phone:       u.phone     || '',
          aboutMe:     u.about_me  || '',
          city:        u.city      || '',
          state:       u.state     || '',
          country:     u.country   || 'United States',
          languages:   u.languages ? u.languages.split(',').map(l => l.trim()) : ['English'],
          gender:      u.gender    || 'Prefer not to say',
        })
      })
      .catch(() => {}) // not logged in — keep mock defaults
  }, [])

  const handleSaveProfile = async (form) => {
    try {
      const res = await updateProfile({
        name:      form.name,
        email:     form.email,
        phone:     form.phone     || null,
        about_me:  form.aboutMe   || null,
        city:      form.city      || null,
        state:     form.state     || null,
        country:   form.country   || null,
        languages: Array.isArray(form.languages) ? form.languages.join(',') : form.languages,
        gender:    form.gender    || null,
      })
      const u = res.data
      setUser(prev => ({
        ...prev,
        name:      u.name,
        email:     u.email,
        phone:     u.phone     || '',
        aboutMe:   u.about_me  || '',
        city:      u.city      || '',
        state:     u.state     || '',
        country:   u.country   || 'United States',
        languages: u.languages ? u.languages.split(',').map(l => l.trim()) : [],
        gender:    u.gender    || 'Prefer not to say',
        location:  [u.city, u.state].filter(Boolean).join(', '),
      }))
    } catch (err) {
      console.error('Failed to update profile:', err)
    }
  }

  if (showCollections) {
    return <CollectionsPage onBack={() => setShowCollections(false)} />
  }

  const handleSectionClick = (key) => {
    if (key === 'collections') {
      setShowCollections(true)
    } else {
      setActiveSection(key)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PageHeader variant="light" showProfileNav />

      {/* Two-column body */}
      <div className="flex flex-1 px-36 py-8 gap-8 items-start">

        {/* ── LEFT COLUMN (⅓) ── */}
        <div className="w-96 shrink-0 flex flex-col gap-0">

          {/* Profile card */}
          <div className="border border-gray-200 rounded-xl p-6 flex flex-col items-center text-center mb-0">
            <AvatarCircle size="lg" />
            <p className="yelp-b1-bold text-gray-900 mt-4">{user.name}</p>
            <p className="yelp-b3 text-gray-400 mt-1">{user.city}{user.state ? `, ${user.state}` : ''}</p>

            {/* Three action buttons */}
            <div className="flex items-start justify-center gap-6 mt-5">
              {/* Edit profile */}
              <div className="flex flex-col items-center gap-1.5">
                <button onClick={() => setShowEditModal(true)} className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <span className="yelp-b4 text-gray-500">Edit profile</span>
              </div>

              {/* Add photo */}
              <div className="flex flex-col items-center gap-1.5">
                <button className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                </button>
                <span className="yelp-b4 text-gray-500">Add photo</span>
              </div>

              {/* Add friends */}
              <div className="flex flex-col items-center gap-1.5">
                <button className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3M13 7a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </button>
                <span className="yelp-b4 text-gray-500">Add friends</span>
              </div>
            </div>
          </div>

          {/* Section navigation */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mt-4">
            {SECTIONS.map((sec, idx) => (
              <div key={sec.key}>
                {idx > 0 && <hr className="border-gray-200" />}
                <button
                  onClick={() => handleSectionClick(sec.key)}
                  className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50 ${
                    activeSection === sec.key && sec.key !== 'collections'
                      ? 'bg-gray-100'
                      : 'bg-white'
                  }`}
                >
                  <span className="text-gray-500">{sec.icon}</span>
                  <span className={`yelp-b3-semi ${
                    activeSection === sec.key && sec.key !== 'collections'
                      ? 'text-gray-900'
                      : 'text-gray-600'
                  }`}>
                    {sec.label}
                  </span>
                </button>
              </div>
            ))}
          </div>

        </div>

        {/* ── RIGHT COLUMN (⅔) ── */}
        <div className="flex-1 min-w-0 pt-1">
          {activeSection === 'overview'     && <ProfileOverviewPanel user={user} />}
          {activeSection === 'reviews'      && <ReviewsPanel />}
          {activeSection === 'events'       && <EventsPanel />}
          {activeSection === 'preferences'  && <PreferencesPanel />}
          {activeSection === 'favorites'    && <FavoritesPanel />}
          {activeSection === 'history'      && <HistoryPanel />}
        </div>

      </div>

      <Footer />

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          user={user}
          onSave={handleSaveProfile}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  )
}
