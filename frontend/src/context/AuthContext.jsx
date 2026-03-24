import { createContext, useContext, useEffect, useState } from 'react'
import { getMe } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await getMe()
        setUser(res.data)
      } catch (err) {
        console.error('Auth restore failed:', err)
        localStorage.removeItem('token')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('token', token)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const res = await getMe()
      setUser(res.data)
      return res.data
    } catch (err) {
      console.error('Failed to refresh user:', err)
      return null
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}