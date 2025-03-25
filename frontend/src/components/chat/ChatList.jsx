import { useState } from 'react'  // ✅ Import useState
import { Box } from '@mui/material'
import Message from './Message'
import { useChat } from '../../context/ChatContext'

function ChatList() {
  const { messages } = useChat()

  return (
    <Box 
      flex={1} 
      p={2} 
      overflow="auto"
      bgcolor="background.default"
    >
      {messages.map((message, index) => (
        <Message 
          key={index} 
          message={message} 
          isCurrentUser={message.sender === 'current-user-id'} 
        />
      ))}
    </Box>
  )
}

export default ChatList
