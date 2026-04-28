import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  list: [],
  selectedRestaurant: null,
}

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    setRestaurants: (state, action) => {
      state.list = action.payload
    },
    setSelectedRestaurant: (state, action) => {
      state.selectedRestaurant = action.payload
    },
    clearSelectedRestaurant: (state) => {
      state.selectedRestaurant = null
    },
  },
})

export const {
  setRestaurants,
  setSelectedRestaurant,
  clearSelectedRestaurant,
} = restaurantSlice.actions

export const selectRestaurants = (state) => state.restaurants.list
export const selectSelectedRestaurant = (state) =>
  state.restaurants.selectedRestaurant

export default restaurantSlice.reducer