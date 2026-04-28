import api from './api'

export const signup = (data) => {
  console.log('SIGNUP URL:', `${api.defaults.baseURL}/auth/signup`)
  console.log('SIGNUP DATA:', data)
  return api.post('/auth/signup', data)
}

export const login = (data) => {
  console.log('LOGIN URL:', `${api.defaults.baseURL}/auth/login`)
  console.log('LOGIN DATA:', data)
  return api.post('/auth/login', data)
}

export const getMe = () => {
  console.log('GETME URL:', `${api.defaults.baseURL}/auth/me`)
  return api.get('/auth/me')
}