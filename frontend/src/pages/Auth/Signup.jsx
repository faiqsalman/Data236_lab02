import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup as signupRequest } from '../../services/authService'

export default function Signup() {
  const navigate = useNavigate()
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signupRequest(form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black/70 flex items-center justify-center">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl px-8 py-10 flex flex-col items-center">

        {/* Avatar placeholder */}
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
          </svg>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-1">Sign up for Yelp</h2>
        <p className="text-sm text-gray-500 mb-5">Connect with great local businesses</p>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center mb-5 leading-relaxed">
          By continuing, you agree to Yelp's{' '}
          <a href="#" className="underline">Terms of Service</a> and acknowledge Yelp's{' '}
          <a href="#" className="underline">Privacy Policy</a>.
        </p>

        {/* Social + email buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button className="flex items-center justify-center gap-3 border border-gray-300 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>
          <button className="flex items-center justify-center gap-3 border border-gray-300 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <img src="https://www.svgrepo.com/show/448234/apple.svg" className="w-5 h-5" alt="Apple" />
            Continue with Apple
          </button>
          <button
            onClick={() => setShowEmailForm(true)}
            className="flex items-center justify-center gap-3 border border-gray-300 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            Continue with email
          </button>
        </div>

        {/* Email form — revealed on click */}
        {showEmailForm && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full mt-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#d32323]"
            />
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
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        )}

        <hr className="w-full border-gray-200 my-5" />

        <p className="text-sm text-gray-600">
          Already on Yelp?{' '}
          <Link to="/login" className="text-[#d32323] font-semibold hover:underline">Log in</Link>
        </p>

      </div>
    </div>
  )
}
