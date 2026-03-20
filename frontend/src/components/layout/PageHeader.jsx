import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import yelpLogoDark from '../../assets/yelp_logo_dark_bg.svg'
import yelpLogoLight from '../../assets/yelp_logo.svg'

const NAV_CATEGORIES = [
  'Restaurants', 'Home & Garden', 'Auto Services',
  'Health & Beauty', 'Travel & Activities', 'More',
]

// variant="dark"       → gradient bg, white text  (used on Home hero)
// variant="light"      → white bg, dark text      (used on all other pages)
// showProfileNav=true  → replaces auth buttons with bell + avatar (used on Profile page)
export default function PageHeader({ variant = 'light', showProfileNav = false }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState({ query: '', location: '' })

  const dark = variant === 'dark'

  const handleSearch = (e) => {
    e.preventDefault()
    navigate(`/?query=${encodeURIComponent(search.query)}&location=${encodeURIComponent(search.location)}`)
  }

  const textCls    = dark ? 'text-white'   : 'text-gray-700'
  const loginCls   = dark ? 'bg-white/15 text-white hover:bg-white/25'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'

  return (
    <div
      className={`flex items-start gap-6 px-6 pt-6 ${dark ? 'pb-14' : 'pb-4 bg-white border-b border-gray-200 shadow-sm'}`}
      style={dark ? { background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)' } : {}}
    >
      {/* Logo — fixed-width column so content aligns with search bar */}
      <Link to="/" className="shrink-0 pt-1 w-24">
        <img src={dark ? yelpLogoDark : yelpLogoLight} alt="Yelp" className="h-8 w-auto" />
      </Link>

      {/* Right column: search bar + categories + nav links */}
      <div className="flex-1 flex flex-col gap-3">

        {/* Row 1: search form + right nav */}
        <div className="flex items-center gap-5">
          <form
            onSubmit={handleSearch}
            className="flex flex-1 max-w-[900px] bg-white rounded-lg overflow-hidden shadow border border-gray-200"
          >
            <input
              type="text"
              value={search.query}
              onChange={(e) => setSearch({ ...search, query: e.target.value })}
              placeholder="things to do, nail salons, plumbers"
              className="flex-1 px-4 py-2.5 yelp-b1 text-gray-700 focus:outline-none min-w-0"
            />
            <div className="w-px bg-gray-300 my-2 shrink-0" />
            <input
              type="text"
              value={search.location}
              onChange={(e) => setSearch({ ...search, location: e.target.value })}
              placeholder="address, neighborhood, city, state, or zip"
              className="flex-1 px-4 py-2.5 yelp-b1 text-gray-700 focus:outline-none min-w-0"
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
          <div className="ml-auto flex items-center gap-5 shrink-0">
            <button className={`yelp-b2 flex items-center gap-1 hover:underline whitespace-nowrap ${textCls}`}>
              Yelp for Business <span className="text-xs">▾</span>
            </button>
            <button className={`yelp-b2 hover:underline whitespace-nowrap ${textCls}`}>Write a Review</button>
            <button className={`yelp-b2 hover:underline whitespace-nowrap ${textCls}`}>Start a Project</button>

            {showProfileNav ? (
              /* Profile page: bell + avatar */
              <div className="flex items-center gap-4">
                <button className={`hover:opacity-70 ${textCls}`} title="Notifications">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <Link to="/profile">
                  <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-gray-400 flex items-center justify-center overflow-hidden hover:opacity-80">
                    <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                    </svg>
                  </div>
                </Link>
              </div>
            ) : user ? (
              <>
                <Link to="/profile" className={`yelp-b2 hover:underline ${textCls}`}>Profile</Link>
                <button
                  onClick={() => logout()}
                  className={`yelp-b2 px-4 py-1.5 rounded whitespace-nowrap ${loginCls}`}
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={`yelp-b2 px-4 py-1.5 rounded whitespace-nowrap ${loginCls}`}>
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="yelp-b2 text-white bg-[#d32323] px-4 py-1.5 rounded hover:bg-red-700 whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Row 2: category dropdowns */}
        <div className="flex items-center gap-6">
          {NAV_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`yelp-b2 flex items-center gap-1 hover:underline whitespace-nowrap ${textCls}`}
            >
              {cat} <span className="text-xs">▾</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
