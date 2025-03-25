import { Box, IconButton, Tooltip, Badge } from '@mui/material'
import { 
  People as PeopleIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material'
import { styled } from '@mui/system'
import { useTheme } from '@mui/material/styles'  // ✅ Import theme hook

function Sidebar() {
  const theme = useTheme()  // ✅ Get the MUI theme

  const SidebarContainer = styled(Box)({
    width: 72,
    backgroundColor: theme.palette.grey[900],  // ✅ Fix: Ensure theme is available
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: theme.spacing(3),
  })

  return (
    <SidebarContainer>
      <Tooltip title="Contacts" placement="right">
        <IconButton color="inherit" sx={{ mb: 3 }}>
          <PeopleIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Chats" placement="right">
        <IconButton color="inherit" sx={{ mb: 3 }}>
          <Badge badgeContent={4} color="error">
            <ChatIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Tooltip title="Notifications" placement="right">
        <IconButton color="inherit" sx={{ mb: 3 }}>
          <Badge badgeContent={2} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Tooltip title="Settings" placement="right">
        <IconButton color="inherit" sx={{ mb: 3 }}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>
    </SidebarContainer>
  )
}

export default Sidebar
