import { Avatar, Box, Typography, IconButton } from '@mui/material'
import { MoreVert, Call, VideoCall } from '@mui/icons-material'

function ChatHeader({ chat }) {
  return (
    <Box 
      display="flex" 
      alignItems="center" 
      p={2} 
      borderBottom="1px solid" 
      borderColor="divider"
      bgcolor="background.paper"
    >
      <Avatar src={chat.isGroup ? chat.avatar : chat.user.avatar} sx={{ mr: 2 }} />
      <Box flex={1}>
        <Typography fontWeight="bold">
          {chat.isGroup ? chat.name : chat.user.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {chat.isGroup ? `${chat.members.length} members` : 'Online'}
        </Typography>
      </Box>
      <IconButton>
        <Call />
      </IconButton>
      <IconButton>
        <VideoCall />
      </IconButton>
      <IconButton>
        <MoreVert />
      </IconButton>
    </Box>
  )
}

export default ChatHeader