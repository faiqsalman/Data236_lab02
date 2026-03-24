import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createRestaurant } from '../../services/restaurantService'

export default function AddRestaurant() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    cuisine_type: '',
    address: '',
    city: '',
    zip_code: '',
    description: '',
    hours: '',
    contact_phone: '',
    contact_email: '',
    pricing_tier: '',
    amenities: '',
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
      const res = await createRestaurant(form)
      navigate(`/restaurants/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add restaurant.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
        <h1 className="text-3xl font-bold mb-6">Add a Restaurant</h1>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <input
            name="name"
            placeholder="Restaurant name"
            value={form.name}
            onChange={handleChange}
            required
            className="border rounded-lg px-4 py-3"
          />
          <input
            name="cuisine_type"
            placeholder="Cuisine type"
            value={form.cuisine_type}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3"
          />
          <input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3"
          />
          <input
            name="city"
            placeholder="City"
            value={form.city}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3"
          />
          <input
            name="zip_code"
            placeholder="ZIP code"
            value={form.zip_code}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3"
          />
          <input
            name="hours"
            placeholder="Hours"
            value={form.hours}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3"
          />
          <input
            name="contact_phone"
            placeholder="Phone"
            value={form.contact_phone}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3"
          />
          <input
            name="contact_email"
            placeholder="Email"
            value={form.contact_email}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3"
          />
          <input
            name="pricing_tier"
            placeholder="Pricing tier ($, $$, $$$)"
            value={form.pricing_tier}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3"
          />
          <input
            name="amenities"
            placeholder="Amenities (comma separated)"
            value={form.amenities}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="border rounded-lg px-4 py-3 md:col-span-2 min-h-[120px]"
          />

          <button
            type="submit"
            disabled={loading}
            className="md:col-span-2 bg-[#d32323] hover:bg-red-700 text-white py-3 rounded-lg font-semibold"
          >
            {loading ? 'Adding...' : 'Add Restaurant'}
          </button>
        </form>
      </div>
    </main>
  )
}