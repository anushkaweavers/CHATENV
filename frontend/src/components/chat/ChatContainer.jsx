import { Box, Typography } from '@mui/material'  // ✅ Import Typography
import ChatHeader from './ChatHeader'
import ChatList from './ChatList'
import ChatInput from './ChatInput'
import { useChat } from '../../context/ChatContext'

function ChatContainer() {
  const { currentChat, messages } = useChat()

  if (!currentChat) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100%"
        bgcolor="background.default"
      >
        <Box textAlign="center">
          <Typography variant="h6" color="text.secondary">
            Select a chat to start messaging
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <ChatHeader chat={currentChat} />
      <ChatList messages={messages} />
      <ChatInput />
    </Box>
  )
}

export default ChatContainer
