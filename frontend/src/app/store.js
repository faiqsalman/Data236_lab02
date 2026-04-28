import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import restaurantReducer from '../features/restaurants/restaurantSlice'
import reviewReducer from '../features/reviews/reviewSlice'
import favouritesReducer from '../features/favourites/favouritesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    restaurants: restaurantReducer,
    reviews: reviewReducer,
    favourites: favouritesReducer,
  },
})

export default store