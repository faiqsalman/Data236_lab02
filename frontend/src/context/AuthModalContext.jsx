import { createContext, useContext, useState } from 'react'

const AuthModalContext = createContext(null)

export function AuthModalProvider({ children }) {
  const [mode, setMode] = useState(null) // null | 'login' | 'signup'

  return (
    <AuthModalContext.Provider value={{
      mode,
      openLogin:  () => setMode('login'),
      openSignup: () => setMode('signup'),
      close:      () => setMode(null),
    }}>
      {children}
    </AuthModalContext.Provider>
  )
}

export const useAuthModal = () => useContext(AuthModalContext)
