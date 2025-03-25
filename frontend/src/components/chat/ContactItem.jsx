import { Avatar, Badge, ListItem, ListItemAvatar, ListItemText, Typography, styled } from '@mui/material'
import { useChat } from '../../context/ChatContext'

const OnlineBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}))

function ContactItem({ contact, selected, onClick }) {
  const { onlineUsers } = useChat()
  const isOnline = onlineUsers.includes(contact._id)

  return (
    <ListItem
      button
      selected={selected}
      onClick={onClick}
      sx={{
        '&.Mui-selected': {
          backgroundColor: 'rgba(0, 175, 240, 0.1)',
        },
        '&:hover': {
          backgroundColor: 'rgba(0, 175, 240, 0.05)',
        },
      }}
    >
      <ListItemAvatar>
        {isOnline ? (
          <OnlineBadge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
          >
            <Avatar src={contact.avatar} />
          </OnlineBadge>
        ) : (
          <Avatar src={contact.avatar} />
        )}
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography fontWeight={selected ? 'bold' : 'normal'}>
            {contact.name}
          </Typography>
        }
        secondary={
          <Typography
            variant="body2"
            color={isOnline ? 'success.main' : 'text.secondary'}
          >
            {isOnline ? 'Online' : 'Offline'}
          </Typography>
        }
      />
    </ListItem>
  )
}

export default ContactItem