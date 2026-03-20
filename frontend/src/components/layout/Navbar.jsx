import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Pages with their own embedded PageHeader — hide the red Navbar
  const hideOn = ['/', '/restaurants', '/profile', '/search']
  if (hideOn.some((p) => location.pathname === p || location.pathname.startsWith('/restaurants/') || location.pathname.startsWith('/profile') || location.pathname.startsWith('/search') || location.pathname.startsWith('/search'))) return null

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-red-600 text-white px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold tracking-tight">
        YelpClone
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/" className="hover:underline">Explore</Link>
        <Link to="/assistant" className="hover:underline">AI Assistant</Link>

        {user ? (
          <>
            <Link to="/profile" className="hover:underline">Profile</Link>
            <button onClick={handleLogout} className="bg-white text-red-600 px-3 py-1 rounded font-medium hover:bg-gray-100">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">Log In</Link>
            <Link to="/signup" className="bg-white text-red-600 px-3 py-1 rounded font-medium hover:bg-gray-100">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
