import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useRef, useState } from 'react'
import api from '../../services/api'

export default function PageHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isHeroPage = location.pathname === '/'
  const isActive = (path) => location.pathname === path

  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const searchRef = useRef(null)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const q = search.trim()
    if (!q) return
    setShowSuggestions(false)
    navigate(`/search?q=${encodeURIComponent(q)}`)
  }

  // 🔍 Suggestions
  useEffect(() => {
    const query = search.trim()

    if (!query || !isHeroPage) {
      setSuggestions([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/restaurants', {
          params: { q: query },
        })

        const data = Array.isArray(res.data) ? res.data : []
        setSuggestions(data.slice(0, 5))
        setShowSuggestions(true)
      } catch {
        setSuggestions([])
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [search, isHeroPage])

  // close dropdown
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const headerClass = isHeroPage
    ? 'absolute top-0 left-0 w-full z-40 bg-transparent'
    : 'relative w-full z-40 bg-white border-b border-gray-200 shadow-sm'

  const navClass = isHeroPage ? 'text-white' : 'text-gray-700'

  const logoClass = isHeroPage ? 'text-white' : 'text-[#d32323]'

  const loginClass = isHeroPage
    ? 'px-3 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition text-sm'
    : 'px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition text-sm'

  const logoutClass = isHeroPage
    ? 'px-3 py-2 rounded-lg font-semibold transition bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm'
    : 'px-3 py-2 rounded-lg font-semibold transition bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm'

  return (
    <header className={headerClass}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">

          {/* 🔥 YelpClone Logo */}
          <Link
            to="/"
            className={`text-xl font-bold tracking-tight ${logoClass}`}
          >
            Yelp
          </Link>

          {/* 🔍 Search */}
          {isHeroPage ? (
            <div ref={searchRef} className="relative max-w-md w-full mx-auto">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center bg-white rounded-xl overflow-hidden shadow-md"
              >
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for pizza, burgers..."
                  className="flex-1 px-4 py-3 text-gray-900 outline-none text-sm"
                />

                <button
                  type="submit"
                  className="bg-[#d32323] hover:bg-red-700 text-white px-4 py-3 flex items-center justify-center"
                >
                  🔍
                </button>
              </form>

              {/* Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute w-full bg-white rounded-xl shadow-lg mt-2 border z-50 overflow-hidden">
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setShowSuggestions(false)
                        navigate(`/restaurants/${item.id}`)
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b last:border-none"
                    >
                      <div className="font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.cuisine_type}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div />
          )}

          {/* Nav + Auth */}
          <div className="flex items-center gap-4 justify-self-end">
            <nav className={`flex items-center gap-4 text-sm ${navClass}`}>
              <Link to="/" className={isActive('/') ? 'text-[#d32323]' : ''}>
                Home
              </Link>

              <Link to="/search" className={isActive('/search') ? 'text-[#d32323]' : ''}>
                Search
              </Link>

              {user && <Link to="/add-restaurant">Add Restaurant</Link>}
              {user && <Link to="/profile">Profile</Link>}
            </nav>

            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <span
                    className={`hidden lg:block text-xs ${
                      isHeroPage ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    Hi, {user.name}
                  </span>

                  <button onClick={handleLogout} className={logoutClass}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className={loginClass}>
                    Log In
                  </Link>

                  <Link
                    to="/signup"
                    className="px-3 py-2 rounded-lg bg-[#d32323] text-white font-semibold hover:bg-red-700 transition text-sm"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  )
}