import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Footer from '../../components/layout/Footer'

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

function ProfileOverviewPanel() {
  return (
    <div>
      <p className="yelp-b1-bold text-gray-900 mb-4">More about me</p>
      <div className="border border-gray-200 rounded-lg px-5 py-4 flex gap-10">
        <div>
          <p className="yelp-b3-semi text-gray-500 mb-1">Location</p>
          <p className="yelp-b3 text-gray-800">{MOCK_USER.location}</p>
        </div>
        <div>
          <p className="yelp-b3-semi text-gray-500 mb-1">Yelping since</p>
          <p className="yelp-b3 text-gray-800">{MOCK_USER.yelpingSince}</p>
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
]

export default function Profile() {
  const [activeSection, setActiveSection] = useState('overview')
  const [showCollections, setShowCollections] = useState(false)

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
            <p className="yelp-b1-bold text-gray-900 mt-4">{MOCK_USER.name}</p>
            <p className="yelp-b3 text-gray-400 mt-1">{MOCK_USER.location}</p>

            {/* Three action buttons */}
            <div className="flex items-start justify-center gap-6 mt-5">
              {/* Edit profile */}
              <div className="flex flex-col items-center gap-1.5">
                <button className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">
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
          {activeSection === 'overview' && <ProfileOverviewPanel />}
          {activeSection === 'reviews'  && <ReviewsPanel />}
          {activeSection === 'events'   && <EventsPanel />}
        </div>

      </div>

      <Footer />
    </div>
  )
}
