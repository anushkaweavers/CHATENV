import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, TextField } from '@mui/material';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Box sx={{ width: '80px', bgcolor: '#f5f5f5', borderRight: '1px solid #e0e0e0' }}>
        {/* Sidebar content */}
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6">Skype</Typography>
        </Box>
      </Box>

      {/* Contacts panel */}
      <Box sx={{ width: '300px', bgcolor: '#ffffff', borderRight: '1px solid #e0e0e0' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6">Contacts</Typography>
        </Box>
        {/* Dummy contacts list */}
        <Box sx={{ p: 2 }}>
          <Typography>John Doe</Typography>
          <Typography>Jane Smith</Typography>
          <Typography>Team Group</Typography>
        </Box>
      </Box>

      {/* Main chat area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Chat header */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Chat with John Doe</Typography>
          <Button onClick={logout} color="primary">
            Logout
          </Button>
        </Box>

        {/* Messages area */}
        <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
          {/* Dummy messages */}
          <Box sx={{ mb: 2, textAlign: 'right' }}>
            <Box sx={{ bgcolor: '#e3f2fd', p: 1, borderRadius: '10px', display: 'inline-block' }}>
              <Typography>Hello there!</Typography>
            </Box>
          </Box>
          <Box sx={{ mb: 2, textAlign: 'left' }}>
            <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: '10px', display: 'inline-block' }}>
              <Typography>Hi! How are you?</Typography>
            </Box>
          </Box>
        </Box>

        {/* Message input */}
        <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
          <TextField fullWidth placeholder="Type a message..." variant="outlined" />
        </Box>
      </Box>
    </Box>
  );
};

export default Home;