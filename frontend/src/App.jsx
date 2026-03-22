import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { AuthModalProvider, useAuthModal } from './context/AuthModalContext'
import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/common/ProtectedRoute'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'

// Pages
import Home from './pages/Home/Home'
import RestaurantDetails from './pages/Restaurant/RestaurantDetails'
import AddRestaurant from './pages/Restaurant/AddRestaurant'
import SearchResults from './pages/Search/SearchResults'
import Profile from './pages/Profile/Profile'
import AIAssistant from './pages/AI/AIAssistant'
import WriteReview from './pages/Review/WriteReview'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AuthModalOverlay() {
  const { mode, openLogin, openSignup, close } = useAuthModal()
  if (!mode) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm bg-black/40"
        onClick={close}
      />
      {/* Modal card */}
      <div className="relative z-10">
        {mode === 'login' && (
          <Login onClose={close} onSwitchToSignup={openSignup} />
        )}
        {mode === 'signup' && (
          <Signup onClose={close} onSwitchToLogin={openLogin} />
        )}
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AuthModalProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Navbar />
          <AuthModalOverlay />
          <main>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/restaurants/:id" element={<RestaurantDetails />} />

              {/* Protected */}
              <Route element={<ProtectedRoute />}>
                <Route path="/assistant" element={<AIAssistant />} />
              </Route>

              {/* Temporarily public for frontend dev */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/restaurants/new" element={<AddRestaurant />} />
              <Route path="/restaurants/:id/review" element={<WriteReview />} />
            </Routes>
          </main>
        </BrowserRouter>
      </AuthModalProvider>
    </AuthProvider>
  )
}

export default App
