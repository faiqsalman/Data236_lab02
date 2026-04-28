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
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('LOGIN FORM SENT:', form)

      const res = await loginRequest(form)
      console.log('LOGIN RESPONSE:', res.data)

      const token = res.data?.access_token
      if (!token) {
        throw new Error('Login succeeded but no access token was returned')
      }

      localStorage.setItem('token', token)

      try {
        const meRes = await getMe()
        console.log('GET ME RESPONSE:', meRes.data)
        login(meRes.data, token)
        navigate('/')
      } catch (meErr) {
        console.log('GET ME STATUS:', meErr.response?.status)
        console.log('GET ME DATA:', meErr.response?.data)
        console.log('GET ME FULL ERROR:', meErr)

        setError(
          meErr.response?.data?.detail ||
            meErr.response?.data?.message ||
            'Login worked, but fetching user profile failed.'
        )
      }
    } catch (err) {
      localStorage.removeItem('token')

      console.log('LOGIN STATUS:', err.response?.status)
      console.log('LOGIN DATA:', err.response?.data)
      console.log('LOGIN FULL ERROR:', err)

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          'Login failed. Please try again.'
      )
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
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 text-xl font-bold text-gray-500 hover:text-black"
        >
          ✕
        </button>

        <h1 className="mb-2 text-center text-3xl font-bold">Log In</h1>
        <p className="mb-6 text-center text-gray-500">Welcome back to YelpClone</p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block font-medium text-gray-800">Email</label>
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
            <label className="mb-1 block font-medium text-gray-800">Password</label>
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
            className="w-full rounded-lg bg-[#d32323] py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium text-[#d32323] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </section>
  )
}