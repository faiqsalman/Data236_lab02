import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { login as loginRequest, getMe } from '../../services/authService'

const BACKGROUND_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await loginRequest(form)
      const token = res.data.access_token

      localStorage.setItem('token', token)

      const meRes = await getMe()
      login(meRes.data, token)

      navigate('/')
    } catch (err) {
      localStorage.removeItem('token')
      setError(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12"
      style={{
        backgroundImage: `url(${BACKGROUND_IMAGE})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
  
        {/* CLOSE BUTTON */}
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl font-bold"
            >
            ✕
          </button>

        <h1 className="text-3xl font-bold text-center mb-2">Log In</h1>
        <p className="text-center text-gray-500 mb-6">
          Welcome back to YelpClone
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-800">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-800">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d32323] hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-[#d32323] hover:underline font-medium">
            Sign Up
          </Link>
        </p>
      </div>
    </section>
  )
}