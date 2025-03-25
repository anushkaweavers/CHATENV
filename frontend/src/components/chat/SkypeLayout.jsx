import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Badge, TextField, IconButton, Tooltip } from '@mui/material'
import { Search, MoreVert, Add, People, Chat, Settings } from '@mui/icons-material'
import { styled } from '@mui/system'

const SkypeSidebar = styled(Box)(({ theme }) => ({
  width: 80,
  backgroundColor: theme.palette.grey[900],
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: theme.spacing(2),
}))

const ContactsSidebar = styled(Box)(({ theme }) => ({
  width: 320,
  backgroundColor: theme.palette.grey[800],
  color: 'white',
  borderRight: `1px solid ${theme.palette.grey[700]}`,
}))

const MainContent = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'white',
})

function SkypeLayout() {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Leftmost sidebar - Skype icons */}
      <SkypeSidebar>
        <Tooltip title="Contacts" placement="right">
          <IconButton color="inherit" sx={{ mb: 3 }}>
            <People />
          </IconButton>
        </Tooltip>
        <Tooltip title="Chats" placement="right">
          <IconButton color="inherit" sx={{ mb: 3 }}>
            <Badge color="error" variant="dot">
              <Chat />
            </Badge>
          </IconButton>
        </Tooltip>
        <Tooltip title="Settings" placement="right">
          <IconButton color="inherit" sx={{ mb: 3 }}>
            <Settings />
          </IconButton>
        </Tooltip>
      </SkypeSidebar>

      {/* Contacts sidebar */}
      <ContactsSidebar>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search contacts"
            InputProps={{
              startAdornment: <Search sx={{ color: 'grey.500', mr: 1 }} />,
              sx: {
                backgroundColor: 'grey.900',
                borderRadius: 2,
                '& fieldset': { border: 'none' },
              },
            }}
          />
        </Box>
        
        <List>
          {[1, 2, 3, 4, 5].map((item) => (
            <ListItem key={item} disablePadding>
              <ListItemButton>
                <ListItemIcon>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    variant="dot"
                    color="success"
                  >
                    <Avatar src={`https://i.pravatar.cc/150?img=${item}`} />
                  </Badge>
                </ListItemIcon>
                <ListItemText 
                  primary={`Contact ${item}`} 
                  secondary={item === 1 ? "Online" : "Last seen recently"} 
                  secondaryTypographyProps={{
                    color: item === 1 ? 'success.main' : 'grey.500'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </ContactsSidebar>

      {/* Main chat area */}
      <MainContent>
        {/* Chat header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2, 
          borderBottom: '1px solid', 
          borderColor: 'grey.200' 
        }}>
          <Avatar src="https://i.pravatar.cc/150?img=3" sx={{ mr: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ fontWeight: 'bold' }}>John Doe</Box>
            <Box sx={{ fontSize: 12, color: 'grey.500' }}>Online</Box>
          </Box>
          <IconButton>
            <MoreVert />
          </IconButton>
        </Box>

        {/* Chat messages */}
        <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
          {/* Example messages */}
          <Box sx={{ 
            display: 'flex', 
            mb: 2, 
            justifyContent: 'flex-start' 
          }}>
            <Box sx={{ 
              bgcolor: 'grey.100', 
              p: 1.5, 
              borderRadius: 4, 
              maxWidth: '70%',
              borderTopLeftRadius: 0
            }}>
              Hi there! How are you doing?
              <Box sx={{ 
                fontSize: 10, 
                color: 'grey.500', 
                textAlign: 'right', 
                mt: 0.5 
              }}>
                10:30 AM
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            mb: 2, 
            justifyContent: 'flex-end' 
          }}>
            <Box sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              p: 1.5, 
              borderRadius: 4, 
              maxWidth: '70%',
              borderTopRightRadius: 0
            }}>
              I'm doing great! Thanks for asking.
              <Box sx={{ 
                fontSize: 10, 
                color: 'grey.200', 
                textAlign: 'right', 
                mt: 0.5 
              }}>
                10:32 AM
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Message input */}
        <Box sx={{ 
          p: 2, 
          borderTop: '1px solid', 
          borderColor: 'grey.200',
          display: 'flex',
          alignItems: 'center'
        }}>
          <IconButton sx={{ mr: 1 }}>
            <Add />
          </IconButton>
          <TextField
            fullWidth
            placeholder="Type a message"
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 20,
                backgroundColor: 'grey.100',
              },
            }}
          />
          <IconButton color="primary" sx={{ ml: 1 }}>
            <Send />
          </IconButton>
        </Box>
      </MainContent>
    </Box>
  )
}

export default SkypeLayout