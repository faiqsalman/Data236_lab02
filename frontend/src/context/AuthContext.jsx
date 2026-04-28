import { createContext, useContext, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { getMe } from '../services/authService'
import {
  setCredentials,
  setUser as setReduxUser,
  logoutUser as logoutReduxUser,
} from '../features/auth/authSlice'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

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
        dispatch(setCredentials({ user: res.data, token }))
        dispatch(setReduxUser(res.data))
      } catch (err) {
        console.error('Auth restore failed:', err)
        localStorage.removeItem('token')
        setUser(null)
        dispatch(logoutReduxUser())
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [dispatch])

  const login = (userData, token) => {
    localStorage.setItem('token', token)
    setUser(userData)
    dispatch(setCredentials({ user: userData, token }))
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    dispatch(logoutReduxUser())
  }

  const refreshUser = async () => {
    try {
      const res = await getMe()
      setUser(res.data)
      dispatch(setReduxUser(res.data))
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