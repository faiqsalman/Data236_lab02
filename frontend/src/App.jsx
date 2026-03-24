import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import PageHeader from './components/layout/PageHeader'
import Home from './pages/Home/Home'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import SearchResults from './pages/Search/SearchResults'
import RestaurantDetails from './pages/Restaurant/RestaurantDetails'
import WriteReview from './pages/Review/WriteReview'
import AIAssistant from './pages/AI/AIAssistant'
import Profile from './pages/Profile/Profile'
import AddRestaurant from './pages/Restaurant/AddRestaurant'
import { useAuth } from './context/AuthContext'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <div className="p-6">Loading...</div>
  if (!user) return <Navigate to="/login" replace />

  return children
}

function AppLayout() {
  return (
    <div className="min-h-screen bg-white">
      <PageHeader />
      <Outlet />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/restaurants/:id" element={<RestaurantDetails />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route
          path="/restaurants/:id/write-review"
          element={
            <ProtectedRoute>
              <WriteReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-restaurant"
          element={
            <ProtectedRoute>
              <AddRestaurant />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}