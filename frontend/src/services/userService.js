import api from './api'

export const getMe = () => api.get('/users/me')
export const updateMe = (data) => api.put('/users/me', data)

export const getPreferences = () => api.get('/users/me/preferences')
export const updatePreferences = (data) => api.put('/users/me/preferences', data)

export const getFavorites = () => api.get('/users/me/favorites')
export const addFavorite = (restaurantId) => api.post(`/users/me/favorites/${restaurantId}`)
export const removeFavorite = (restaurantId) => api.delete(`/users/me/favorites/${restaurantId}`)

export const getUserHistory = () => api.get('/users/me/history')