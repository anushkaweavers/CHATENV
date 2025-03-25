import apiClient from './apiClient'

export const getContacts = async () => {
  return apiClient.get('chat/contacts')
}

export const getChatHistory = async (chatId) => {
  return apiClient.get(`chat/history/${chatId}`)
}

export const sendMessage = async (chatId, message) => {
  return apiClient.post(`chat/send/${chatId}`, { message })
}

export const createGroup = async (groupData) => {
  return apiClient.post('chat/groups', groupData)
}