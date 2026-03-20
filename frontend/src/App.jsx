import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import ProtectedRoute from './components/common/ProtectedRoute'

// Pages
import Home from './pages/Home/Home'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import RestaurantDetails from './pages/Restaurant/RestaurantDetails'
import AddRestaurant from './pages/Restaurant/AddRestaurant'
import Profile from './pages/Profile/Profile'
import AIAssistant from './pages/AI/AIAssistant'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/restaurants/:id" element={<RestaurantDetails />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
              <Route path="/restaurants/new" element={<AddRestaurant />} />
              <Route path="/assistant" element={<AIAssistant />} />
            </Route>

            {/* Temporarily public for frontend dev (no backend yet) */}
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
