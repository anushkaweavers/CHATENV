import apiClient from './apiClient'

export const registerUser = async (userData) => {
  return apiClient.post('auth/register', userData)
}

export const loginUser = async (credentials) => {
  return apiClient.post('auth/login', credentials)
}

export const checkAuth = async () => {
  return apiClient.get('auth/me')
}