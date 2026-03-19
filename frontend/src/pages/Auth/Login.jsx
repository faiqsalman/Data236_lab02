import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { login as loginRequest } from '../../services/authService'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await loginRequest(form)
      login(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black/70 flex items-center justify-center">

      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl px-8 py-10 flex flex-col items-center">

        {/* Avatar placeholder circle */}
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-1">Sign in to Yelp</h2>
        <p className="text-sm text-gray-500 mb-5">Connect with great local businesses</p>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center mb-5 leading-relaxed">
          By continuing, you agree to Yelp's{' '}
          <a href="#" className="underline">Terms of Service</a> and acknowledge Yelp's{' '}
          <a href="#" className="underline">Privacy Policy</a>.
        </p>

        {/* Social buttons */}
        <div className="flex flex-col gap-3 w-full mb-4">
          <button className="flex items-center justify-center gap-3 border border-gray-300 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>
          <button className="flex items-center justify-center gap-3 border border-gray-300 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <img src="https://www.svgrepo.com/show/448234/apple.svg" className="w-5 h-5" alt="Apple" />
            Continue with Apple
          </button>
        </div>

        {/* OR divider */}
        <div className="flex items-center gap-3 w-full my-2">
          <hr className="flex-1 border-gray-300" />
          <span className="text-sm text-gray-400">or</span>
          <hr className="flex-1 border-gray-300" />
        </div>

        {/* Email/Password form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full mt-2">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d32323]"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d32323]"
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#d32323] text-white py-2 rounded font-semibold text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <button className="text-sm text-[#d32323] hover:underline mt-3">
          Login via email link
        </button>

        <hr className="w-full border-gray-200 my-5" />

        <p className="text-sm text-gray-600">
          New to Yelp?{' '}
          <Link to="/signup" className="text-[#d32323] font-semibold hover:underline">Sign up</Link>
        </p>

      </div>
    </div>
  )
}
