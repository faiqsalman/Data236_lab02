import api from './api'

export const getRestaurants = (params) => api.get('/restaurants', { params })

export const getRestaurant = (id) => api.get(`/restaurants/${id}`)
export const getRestaurantById = (id) => api.get(`/restaurants/${id}`)

export const createRestaurant = (data) => api.post('/restaurants', data)
export const claimRestaurant = (id) => api.post(`/restaurants/${id}/claim`)

export const getRestaurantReviews = (id) => api.get(`/restaurants/${id}/reviews`)
export const createReview = (id, data) => api.post(`/restaurants/${id}/reviews`, data)