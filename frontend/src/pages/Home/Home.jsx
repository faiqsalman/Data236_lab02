import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const SLIDES = [
  {
    text: 'Stress-free moving',
    searchText: 'Movers',
    bg: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=1600&q=80&auto=format&fit=crop',
    photoTitle: 'Stress-free moving',
    author: 'Unsplash',
  },
  {
    text: 'Get a deep clean',
    searchText: 'Cleaners',
    bg: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=80&auto=format&fit=crop',
    photoTitle: 'Get a deep clean',
    author: 'Unsplash',
  },
  {
    text: 'Big day? Dream spot.',
    searchText: 'Wedding venues',
    bg: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80&auto=format&fit=crop',
    photoTitle: 'Big day? Dream spot.',
    author: 'Unsplash',
  },
  {
    text: 'Keep your car feeling fresh',
    searchText: 'Auto detailing',
    bg: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=1600&q=80&auto=format&fit=crop',
    photoTitle: 'Keep your car feeling fresh',
    author: 'Unsplash',
  },
]

const CATEGORIES = [
  'Restaurants',
  'Home & Garden',
  'Auto Services',
  'Health & Beauty',
  'Travel & Activities',
  'More',
]

const SLIDE_DURATION = 5000

export default function Home() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [search, setSearch] = useState({ query: '', location: '' })
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (paused) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length)
    }, SLIDE_DURATION)
    return () => clearInterval(timer)
  }, [paused])

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/?query=${search.query}&location=${search.location}`)
  }

  const slide = SLIDES[current]

  return (
    <div className="relative h-screen overflow-hidden">

      {/* Background photos — full color, no overlay */}
      {SLIDES.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${s.bg})`,
            opacity: i === current ? 1 : 0,
          }}
        />
      ))}

      {/* All content */}
      <div className="relative z-10 flex flex-col h-full text-white">

        {/* HEADER STRIP — gradient only here */}
        <div
          className="flex items-start px-6 pt-4 pb-8 gap-5"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)' }}
        >
          {/* Yelp Logo */}
          <Link
            to="/"
            className="text-white font-bold text-3xl italic flex items-center gap-1 pt-1 shrink-0"
          >
            yelp
            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
              <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 19.445l-7.416 3.968 1.48-8.279L.001 9.306l8.332-1.151z" />
            </svg>
          </Link>

          {/* Search bar + right links + category dropdowns */}
          <div className="flex-1 flex flex-col gap-2">

            {/* Top row: search bar + right nav */}
            <div className="flex items-center gap-4">

              {/* Search bar */}
              <form
                onSubmit={handleSearch}
                className="flex flex-1 max-w-2xl bg-white rounded-lg overflow-hidden shadow-lg"
              >
                <input
                  type="text"
                  value={search.query}
                  onChange={(e) => setSearch({ ...search, query: e.target.value })}
                  placeholder="things to do, nail salons, plumbers"
                  className="flex-1 px-4 py-2.5 text-sm text-gray-700 focus:outline-none min-w-0"
                />
                <div className="w-px bg-gray-300 my-2 shrink-0" />
                <input
                  type="text"
                  value={search.location}
                  onChange={(e) => setSearch({ ...search, location: e.target.value })}
                  placeholder="address, neighborhood, city, state, or zip"
                  className="flex-1 px-4 py-2.5 text-sm text-gray-700 focus:outline-none min-w-0"
                />
                <button
                  type="submit"
                  className="bg-[#d32323] text-white px-4 flex items-center justify-center hover:bg-red-700 shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                </button>
              </form>

              {/* Right nav links */}
              <div className="flex items-center gap-4 text-white text-sm shrink-0">
                <button className="flex items-center gap-0.5 hover:underline whitespace-nowrap">
                  Yelp for Business <span className="ml-1 text-xs">▾</span>
                </button>
                <button className="hover:underline whitespace-nowrap">Write a Review</button>
                <button className="hover:underline whitespace-nowrap">Start a Project</button>

                {user ? (
                  <>
                    <Link to="/profile" className="hover:underline">Profile</Link>
                    <button
                      onClick={() => logout()}
                      className="border border-white/50 bg-white/10 px-3 py-1 rounded hover:bg-white/20 whitespace-nowrap"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="border border-white/50 bg-white/10 px-3 py-1 rounded hover:bg-white/20 whitespace-nowrap"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/signup"
                      className="bg-[#d32323] px-3 py-1 rounded hover:bg-red-700 whitespace-nowrap"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Category dropdowns row */}
            <div className="flex items-center gap-5 text-white text-sm">
              {CATEGORIES.map((cat) => (
                <button key={cat} className="flex items-center gap-0.5 hover:underline whitespace-nowrap">
                  {cat} <span className="ml-0.5 text-xs">▾</span>
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* HERO CARD — sits over the full-color photo */}
        <div className="flex-1 flex items-center px-10">
          <div className="flex items-start gap-5">

            {/* Vertical slide indicator bars */}
            <div className="flex flex-col gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="relative w-1 h-16 rounded-full bg-white/30 overflow-hidden"
                >
                  {i < current && (
                    <div className="absolute inset-0 bg-white" />
                  )}
                  {i === current && (
                    <div
                      key={current}
                      className="absolute top-0 left-0 w-full bg-white"
                      style={{
                        animation: paused ? 'none' : `fillBar ${SLIDE_DURATION}ms linear forwards`,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Slide text + search button */}
            <div>
              <h1 className="text-4xl font-bold mb-5 drop-shadow-lg">{slide.text}</h1>
              <button
                onClick={() => setSearch({ ...search, query: slide.searchText })}
                className="flex items-center gap-2 bg-[#d32323] text-white px-5 py-2.5 rounded font-semibold hover:bg-red-700 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                {slide.searchText}
              </button>
            </div>

          </div>
        </div>

        {/* BOTTOM: pause + photo credit */}
        <div className="px-10 pb-6">
          <button
            onClick={() => setPaused(!paused)}
            className="text-white/70 hover:text-white mb-3"
          >
            {paused ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            )}
          </button>
          <p className="text-white font-semibold text-sm drop-shadow">{slide.photoTitle}</p>
          <p className="text-white/70 text-xs mt-0.5">Photo by {slide.author}</p>
        </div>

      </div>

      {/* Keyframe for bar fill animation */}
      <style>{`
        @keyframes fillBar {
          from { height: 0% }
          to { height: 100% }
        }
      `}</style>

    </div>
  )
}
