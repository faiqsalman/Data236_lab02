import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup as signupRequest } from '../../services/authService'

const BACKGROUND_IMAGE =
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80'

export default function Signup() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await signupRequest(form)
      setSuccess('Account created successfully. Please log in.')
      setTimeout(() => navigate('/login'), 1000)
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.')
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

  <h1 className="text-3xl font-bold text-center mb-2">Sign Up</h1>
        <p className="text-center text-gray-500 mb-6">
          Create your YelpClone account
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-100 text-green-700 px-4 py-3 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-gray-800">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>

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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#d32323] hover:underline font-medium">
            Log In
          </Link>
        </p>
      </div>
    </section>
  )
}