import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  list: [],
}

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    setReviews: (state, action) => {
      state.list = action.payload
    },
    addReview: (state, action) => {
      state.list.unshift(action.payload)
    },
    clearReviews: (state) => {
      state.list = []
    },
  },
})

export const { setReviews, addReview, clearReviews } = reviewSlice.actions

export const selectReviews = (state) => state.reviews.list

export default reviewSlice.reducer