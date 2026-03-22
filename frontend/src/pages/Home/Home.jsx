import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/layout/PageHeader'
import Footer from '../../components/layout/Footer'

// ── Slide data ───────────────────────────────────────────────────────────────
const SLIDES = [
  { text: 'Stress-free moving',          searchText: 'Movers',         bg: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=1600&q=80&auto=format&fit=crop', photoTitle: 'Stress-free moving',          author: 'Unsplash' },
  { text: 'Get a deep clean',             searchText: 'Cleaners',       bg: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=80&auto=format&fit=crop', photoTitle: 'Get a deep clean',             author: 'Unsplash' },
  { text: 'Big day? Dream spot.',         searchText: 'Wedding venues', bg: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80&auto=format&fit=crop', photoTitle: 'Big day? Dream spot.',         author: 'Unsplash' },
  { text: 'Keep your car feeling fresh',  searchText: 'Auto detailing', bg: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=1600&q=80&auto=format&fit=crop', photoTitle: 'Keep your car feeling fresh',  author: 'Unsplash' },
]

const SLIDE_DURATION = 5000

// ── Review cards ─────────────────────────────────────────────────────────────
const ALL_REVIEWS = [
  { id: 1,  restaurantId: 1, user: 'Sarah M.',  action: 'wrote a review',  time: 'Just now',       photo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80', business: 'Pizza Palace',    rating: 5, text: 'Absolutely incredible experience! The food was divine and the service was impeccable. I could not have asked for a better evening out.' },
  { id: 2,  restaurantId: 2, user: 'James R.',  action: 'added a photo',   time: '2 minutes ago',  photo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', business: 'Burger Hub',      rating: 4, text: 'Best burger I have had in years. The patty was perfectly seasoned and the brioche bun was toasted to perfection. Will definitely return.' },
  { id: 3,  restaurantId: 3, user: 'Mia L.',    action: 'wrote a review',  time: '15 minutes ago', photo: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80', business: 'Spice Garden',    rating: 5, text: 'Fresh flavors, beautiful presentation, and friendly staff. The curry was worth every penny. One of the best in the city.' },
  { id: 4,  restaurantId: 4, user: 'Tom B.',    action: 'wrote a review',  time: '1 hour ago',     photo: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80', business: 'Dragon Express',  rating: 4, text: 'A hidden gem for Asian food lovers. The dumplings were smooth and complex in flavor. Cozy atmosphere perfect for a casual dinner.' },
  { id: 5,  restaurantId: 5, user: 'Lisa K.',   action: 'added 3 photos',  time: '2 hours ago',    photo: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80', business: 'Taco Fiesta',     rating: 5, text: 'Authentic street-style tacos that transport you straight to Mexico City. The al pastor is a must-try. Great value and incredibly fast.' },
  { id: 6,  restaurantId: 1, user: 'Mark D.',   action: 'wrote a review',  time: '3 hours ago',    photo: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=80', business: 'Pizza Palace',    rating: 5, text: 'The crust was perfectly crispy and the toppings were fresh. Clean, modern space and the vibe is great for families.' },
  { id: 7,  restaurantId: 2, user: 'Anna P.',   action: 'wrote a review',  time: '4 hours ago',    photo: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', business: 'Burger Hub',      rating: 4, text: 'Wood-fired burgers with a perfectly charred patty and fresh toppings. The classic is done right. Will definitely bring the family.' },
  { id: 8,  restaurantId: 3, user: 'Chris W.',  action: 'added a photo',   time: '5 hours ago',    photo: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&q=80', business: 'Spice Garden',    rating: 4, text: 'Incredible spice combinations paired with generous portions. The chefs know their craft and the lunch specials are unbeatable.' },
  { id: 9,  restaurantId: 4, user: 'Nina F.',   action: 'wrote a review',  time: '6 hours ago',    photo: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80', business: 'Dragon Express',  rating: 5, text: 'Top-notch dishes, clean facilities, and staff who care about your experience. Came back three times in one week.' },
  { id: 10, restaurantId: 5, user: 'Paul G.',   action: 'wrote a review',  time: '7 hours ago',    photo: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', business: 'Taco Fiesta',     rating: 5, text: 'Over 10 taco varieties all made fresh. The salsa and guac are standouts. Generous portions and very fair prices.' },
  { id: 11, restaurantId: 1, user: 'Rachel T.', action: 'added 2 photos',  time: '8 hours ago',    photo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80', business: 'Pizza Palace',    rating: 4, text: 'The pizzas are baked fresh every order and it shows. The margherita is flaky and saucy — pairs perfectly with their house wine.' },
  { id: 12, restaurantId: 2, user: 'Owen C.',   action: 'wrote a review',  time: '10 hours ago',   photo: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80', business: 'Burger Hub',      rating: 3, text: 'Good food and a lively atmosphere but the wait times are long. Great spot for a casual night out if you are not in a rush.' },
  { id: 13, restaurantId: 3, user: 'Grace Y.',  action: 'wrote a review',  time: '12 hours ago',   photo: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=80', business: 'Spice Garden',    rating: 5, text: 'Authentic Indian food with top-quality marinated meats. The naan selection is generous and service is attentive without being intrusive.' },
  { id: 14, restaurantId: 4, user: 'Ben H.',    action: 'added a photo',   time: '14 hours ago',   photo: 'https://images.unsplash.com/photo-1587899897387-091ebd01a6b2?w=400&q=80', business: 'Dragon Express',  rating: 4, text: 'Fast, fresh, and fairly priced. The noodle soup was ready in under 10 minutes and tasted like it simmered all day. A hidden gem.' },
  { id: 15, restaurantId: 5, user: 'Chloe M.',  action: 'wrote a review',  time: '1 day ago',      photo: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&q=80', business: 'Taco Fiesta',     rating: 5, text: 'The fish tacos were absolutely divine. The space is vibrant, the staff is friendly, and I left completely satisfied and full.' },
]

// ── Category cards ────────────────────────────────────────────────────────────
const CATEGORY_CARDS = [
  { name: 'Restaurants',    icon: <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="#d32323" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg> },
  { name: 'Shopping',       icon: <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="#d32323" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v10H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg> },
  { name: 'Nightlife',      icon: <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="#d32323" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg> },
  { name: 'Active Life',    icon: <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="#d32323" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M13.41 10.59l4.95-4.95" strokeWidth="2"/></svg> },
  { name: 'Beauty & Spas',  icon: <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="1" width="6" height="22" rx="3" fill="none" stroke="#d32323" strokeWidth="1.5"/><path d="M9 5h6" stroke="#fff" strokeWidth="1"/><path d="M9 9h6" stroke="#2563eb" strokeWidth="2"/><path d="M9 13h6" stroke="#fff" strokeWidth="1"/><path d="M9 17h6" stroke="#d32323" strokeWidth="2"/><path d="M9 21h6" stroke="#fff" strokeWidth="1"/></svg> },
  { name: 'Automotive',     icon: <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="#d32323" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 17h6"/></svg> },
  { name: 'Home Services',  icon: <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="#d32323" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> },
  { name: 'More',           icon: <svg className="w-14 h-14" viewBox="0 0 24 24" fill="#d32323"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg> },
]

// ── City explore data ─────────────────────────────────────────────────────────
const CITIES = [
  'Los Angeles', 'New York', 'Chicago', 'Houston', 'San Diego',
  'Las Vegas', 'San Francisco', 'Dallas', 'San Jose', 'Phoenix',
  'Philadelphia', 'Atlanta', 'Austin', 'Brooklyn', 'Seattle',
]

const CITY_STATES = {
  'Los Angeles': 'CA', 'New York': 'NY', 'Chicago': 'IL', 'Houston': 'TX',
  'San Diego': 'CA', 'Las Vegas': 'NV', 'San Francisco': 'CA', 'Dallas': 'TX',
  'San Jose': 'CA', 'Phoenix': 'AZ', 'Philadelphia': 'PA', 'Atlanta': 'GA',
  'Austin': 'TX', 'Brooklyn': 'NY', 'Seattle': 'WA',
}

const TOP_SEARCHES_INITIAL = [
  'Mexican Restaurants', 'Sushi Restaurants', 'Rooftop Bars',     'Brunch',
  'Coffee Shops',        'Nail Salons',        'Hair Salons',       'Massage',
  'Plumbers',            'Auto Repair',        'Pizza',             'Food Delivery',
]
const TOP_SEARCHES_MORE = [
  'Tacos',          'Happy Hour',     'Gyms',           'Dog Groomers',
  'Dentists',       'Yoga Studios',   'Nightclubs',     'Seafood',
  'Karaoke Bars',   'Bakeries',       'Juice Bars',     'Tattoo Shops',
]

const TRENDING_INITIAL = [
  'Best tacos near me',        'Outdoor dining',             'Dog-friendly restaurants', 'Brunch cocktails',
  'Late night food',           'Vegan restaurants',          'Date night spots',         'Live music venues',
  'Food trucks',               'Speakeasy bars',             'New restaurants 2025',     'Happy hour deals',
]
const TRENDING_MORE = [
  'Best ramen',            'Rooftop happy hour', 'Best burger',        'Wine bars',
  'Plant-based dining',    'Best margaritas',    'Farm to table',      'Omakase experience',
  'Bottomless brunch',     'Best desserts',      'Hidden gem cafes',   'Best views dining',
]

const RECENT_BUSINESSES_INITIAL = [
  'Nobu Malibu',      'Catch LA',           'The Ivy',          'Bestia',
  'République',       'Majordomo',          'Found Oyster',     'Gjelina',
  'Night + Market',   'Horses Restaurant',  'Bavel',            'n/naka',
]
const RECENT_BUSINESSES_MORE = [
  'Perle Wine Bar',   'Dialogue',           'Rossoblu',         'Yours Truly',
  'Here\'s Looking At You', 'Camphor',      'Felix Trattoria',  'Osteria Mozza',
  'Ink & Iron',       'Fishing With Dynamite', 'Destroyer',     'Providence',
]


// ── Sub-components ─────────────────────────────────────────────────────────────
function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5 my-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-4 h-4 ${s <= rating ? 'fill-[#d32323]' : 'fill-gray-200'}`} viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function ReviewCard({ review }) {
  const navigate = useNavigate()
  return (
    <div onClick={() => navigate(`/restaurants/${review.restaurantId}`)}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 p-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="yelp-b2-semi text-gray-900">{review.user} <span className="yelp-b2 text-gray-600">{review.action}</span></p>
          <p className="yelp-b3 text-gray-400">{review.time}</p>
        </div>
      </div>
      <div className="w-full h-40 overflow-hidden">
        <img src={review.photo} alt={review.business} className="w-full h-full object-cover" />
      </div>
      <div className="px-3 pt-3 flex-1">
        <h3 className="yelp-b1-semi text-gray-900">{review.business}</h3>
        <StarRating rating={review.rating} />
        <p className="yelp-b2 text-gray-600 line-clamp-2">{review.review}</p>
        <button className="yelp-b2 text-[#d32323] hover:underline mt-0.5">Read more</button>
      </div>
      <div className="mt-3">
        <hr className="border-gray-100" />
        <div className="flex items-center gap-5 px-3 py-2">
          <button className="text-gray-400 hover:text-yellow-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21h6m-3-3v-4m0 0a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button className="text-gray-400 hover:text-blue-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14.5 2.5c.83 0 1.5.67 1.5 1.5v5l2-1c.83 0 1.5.67 1.5 1.5S20 11 20 11l-6 6c-1 1-2.5 1.5-4 1.5A5.5 5.5 0 0 1 4.5 13V8c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V4c0-.83.67-1.5 1.5-1.5S10.5 3.17 10.5 4V2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5z" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button className="text-gray-400 hover:text-red-500 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button className="text-gray-400 hover:text-green-400 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round"/><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round"/><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round"/><path d="M17.5 7.5c.5-1.5 2-1.5 2-3" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// Reusable 4-column search grid with show more/less
function SearchGrid({ title, initial, more }) {
  const [expanded, setExpanded] = useState(false)
  const items = expanded ? [...initial, ...more] : initial

  return (
    <div className="mb-10">
      <h3 className="yelp-h4 text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-4 gap-y-2 gap-x-4">
        {items.map((item, i) => (
          <button key={i} className="yelp-b2 text-[#d32323] hover:underline text-left truncate">
            {item}
          </button>
        ))}
      </div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-4 flex items-center gap-1 yelp-b2-semi text-gray-600 hover:text-gray-900"
      >
        {expanded ? 'Show less' : 'Show more'}
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Home() {
  const [current, setCurrent]               = useState(0)
  const [paused, setPaused]                 = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [selectedCity, setSelectedCity]     = useState('Los Angeles')
  const navigate                            = useNavigate()

  const visibleReviews = showAllReviews ? ALL_REVIEWS : ALL_REVIEWS.slice(0, 12)
  const cityState      = CITY_STATES[selectedCity]

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => setCurrent((p) => (p + 1) % SLIDES.length), SLIDE_DURATION)
    return () => clearInterval(timer)
  }, [paused])

  const slide = SLIDES[current]

  return (
    <div>
      {/* ── HERO (75vh) ─────────────────────────────────────────────────────── */}
      <div className="relative h-[75vh] overflow-hidden">
        {SLIDES.map((s, i) => (
          <div key={i} className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
            style={{ backgroundImage: `url(${s.bg})`, opacity: i === current ? 1 : 0 }} />
        ))}

        <div className="relative z-10 flex flex-col h-full text-white">
          {/* Shared header — dark variant (gradient over photo) */}
          <PageHeader variant="dark" />

          {/* Slide card */}
          <div className="flex-1 flex items-center px-6">
            <div className="w-24 shrink-0 mr-6" />
            <div className="flex items-start gap-6">
              <div className="flex flex-col gap-2">
                {SLIDES.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)}
                    className="relative w-1.5 h-20 rounded-full bg-white/30 overflow-hidden">
                    {i < current && <div className="absolute inset-0 bg-white" />}
                    {i === current && (
                      <div key={current} className="absolute top-0 left-0 w-full bg-white"
                        style={{ animation: paused ? 'none' : `fillBar ${SLIDE_DURATION}ms linear forwards` }} />
                    )}
                  </button>
                ))}
              </div>
              <div>
                <h1 className="yelp-h1 text-white drop-shadow-lg mb-6">{slide.text}</h1>
                <button onClick={() => navigate(`/?query=${encodeURIComponent(slide.searchText)}`)}
                  className="flex items-center gap-2 bg-[#d32323] text-white px-5 py-2.5 rounded yelp-b1-display-bold hover:bg-red-700 shadow-lg">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                  {slide.searchText}
                </button>
              </div>
            </div>
          </div>

          {/* Photo credit */}
          <div className="px-6 pb-6 ml-[calc(6rem+1.5rem)]">
            <button onClick={() => setPaused(!paused)} className="text-white/70 hover:text-white mb-2">
              {paused
                ? <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              }
            </button>
            <p className="yelp-b2-semi text-white drop-shadow">{slide.photoTitle}</p>
            <p className="yelp-b3 text-white/70">Photo by {slide.author}</p>
          </div>
        </div>

        <style>{`@keyframes fillBar { from { height: 0% } to { height: 100% } }`}</style>
      </div>

      {/* ── RECENT ACTIVITY ──────────────────────────────────────────────────── */}
      <div className="bg-white px-36 py-12">
        <h2 className="yelp-h2 text-gray-900 text-center mb-10">Recent Activity</h2>
        <div className="grid grid-cols-3 gap-5">
          {visibleReviews.map((r) => <ReviewCard key={r.id} review={r} />)}
        </div>
        {!showAllReviews && ALL_REVIEWS.length > 12 && (
          <div className="flex flex-col items-center mt-8">
            <button onClick={() => setShowAllReviews(true)}
              className="flex flex-col items-center text-gray-500 hover:text-gray-800 transition-colors gap-1">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              <span className="yelp-b2-semi">Show more activity</span>
            </button>
          </div>
        )}
      </div>

      {/* ── CATEGORIES ───────────────────────────────────────────────────────── */}
      <div className="bg-white px-36 pb-16">
        <hr className="border-gray-200 mb-10" />
        <h2 className="yelp-h2 text-gray-900 text-center mb-8">Categories</h2>
        <div className="grid grid-cols-4 gap-5">
          {CATEGORY_CARDS.map((cat) => (
            <button key={cat.name}
              className="flex flex-col items-center justify-center gap-4 bg-white border border-gray-200 rounded-xl py-8 px-4 hover:shadow-md hover:border-gray-300 transition-all">
              {cat.icon}
              <span className="yelp-b1-semi text-gray-700">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── EXPLORE SEARCHES IN POPULAR CITIES ───────────────────────────────── */}
      <div className="bg-white px-36 pb-16">
        <hr className="border-gray-200 mb-10" />

        <h2 className="yelp-h2 text-gray-900 mb-1">Explore searches in popular cities</h2>
        <p className="yelp-b1 text-gray-500 mb-6">Discover what people are searching for in each city</p>

        {/* City buttons */}
        <div className="flex flex-wrap gap-3 mb-10">
          {CITIES.map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`yelp-b2 px-4 py-2 rounded-full border transition-all ${
                selectedCity === city
                  ? 'border-[#d32323] text-[#d32323] bg-red-50'
                  : 'border-gray-300 text-gray-700 bg-white hover:border-gray-400'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Top Searches */}
        <SearchGrid
          title={`Top Searches in ${selectedCity}, ${cityState}`}
          initial={TOP_SEARCHES_INITIAL}
          more={TOP_SEARCHES_MORE}
        />

        {/* Trending Searches */}
        <SearchGrid
          title={`Trending Searches in ${selectedCity}, ${cityState}`}
          initial={TRENDING_INITIAL}
          more={TRENDING_MORE}
        />

        {/* Recently Reviewed Businesses */}
        <SearchGrid
          title={`Recently Reviewed Businesses in ${selectedCity}, ${cityState}`}
          initial={RECENT_BUSINESSES_INITIAL}
          more={RECENT_BUSINESSES_MORE}
        />
      </div>

      <Footer />
    </div>
  )
}
