import { Avatar, Box, Typography } from '@mui/material'
import { format } from 'date-fns'

function Message({ message, isCurrentUser }) {
  return (
    <Box
      sx={{
        display: 'flex',
        mb: 2,
        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
      }}
    >
      {!isCurrentUser && (
        <Avatar
          src={message.sender.avatar}
          sx={{ mr: 1, alignSelf: 'flex-end' }}
        />
      )}
      <Box
        sx={{
          bgcolor: isCurrentUser ? 'primary.main' : 'grey.100',
          color: isCurrentUser ? 'white' : 'text.primary',
          p: 1.5,
          borderRadius: 4,
          maxWidth: '70%',
          borderTopLeftRadius: isCurrentUser ? 4 : 0,
          borderTopRightRadius: isCurrentUser ? 0 : 4,
        }}
      >
        <Typography variant="body1">{message.content}</Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            color: isCurrentUser ? 'grey.300' : 'grey.500',
            textAlign: 'right',
            mt: 0.5,
          }}
        >
          {format(new Date(message.timestamp), 'h:mm a')}
        </Typography>
      </Box>
    </Box>
  )
}

export default Message