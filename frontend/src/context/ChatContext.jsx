import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'
import { getContacts, getChatHistory, createGroup } from '../api/chat'

const ChatContext = createContext()

export function ChatProvider({ children }) {
  const [contacts, setContacts] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [groups, setGroups] = useState([])
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])

  // Check if socket should be enabled
  const SOCKET_ENABLED = import.meta.env.VITE_SOCKET_ENABLED === "true"

  // Initialize socket connection if enabled
  useEffect(() => {
    if (!SOCKET_ENABLED) return

    const newSocket = io('http://localhost:3000', { withCredentials: true })
    setSocket(newSocket)

    return () => newSocket.close()
  }, [SOCKET_ENABLED])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    const messageHandler = (message) => {
      if (currentChat && 
          (message.chatId === currentChat._id || 
           message.groupId === currentChat._id)) {
        setMessages(prev => [...prev, message])
      }
    }

    const onlineUsersHandler = (users) => {
      setOnlineUsers(users)
    }

    socket.on('message', messageHandler)
    socket.on('onlineUsers', onlineUsersHandler)

    return () => {
      socket.off('message', messageHandler)
      socket.off('onlineUsers', onlineUsersHandler)
    }
  }, [socket, currentChat])

  const loadContacts = useCallback(async () => {
    try {
      const data = await getContacts()
      setContacts(data)
    } catch (error) {
      console.error('Failed to load contacts:', error)
    }
  }, [])

  const loadChat = useCallback(async (chatId) => {
    try {
      const chatData = await getChatHistory(chatId)
      setCurrentChat(chatData.chat)
      setMessages(chatData.messages)
    } catch (error) {
      console.error('Failed to load chat:', error)
    }
  }, [])

  const sendMessage = useCallback((content) => {
    if (!currentChat || !socket) return

    const message = {
      content,
      sender: currentChat.user._id,
      timestamp: new Date()
    }

    if (currentChat.isGroup) {
      socket.emit('groupMessage', {
        groupId: currentChat._id,
        message
      })
    } else {
      socket.emit('privateMessage', {
        chatId: currentChat._id,
        message
      })
    }

    setMessages(prev => [...prev, message])
  }, [currentChat, socket])

  const createNewGroup = useCallback(async (groupData) => {
    try {
      const newGroup = await createGroup(groupData)
      setGroups(prev => [...prev, newGroup])
      return newGroup
    } catch (error) {
      console.error('Failed to create group:', error)
      throw error
    }
  }, [])

  return (
    <ChatContext.Provider value={{
      contacts,
      currentChat,
      messages,
      groups,
      onlineUsers,
      loadContacts,
      loadChat,
      sendMessage,
      createNewGroup
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  return useContext(ChatContext)
}
