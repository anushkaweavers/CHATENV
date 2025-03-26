import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Box, Typography, Container, Link, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credentials);
      setOpenDialog(true);  // Show dialog on success
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
    navigate('/');  // Redirect to home after dialog is closed
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in to ChitChat
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={credentials.email}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={credentials.password}
            onChange={handleChange}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, bgcolor: '#00A4EF', '&:hover': { bgcolor: '#0088CC' } }}
          >
            Sign In
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link href="/register" variant="body2">
              Don't have an account? Sign Up
            </Link>
          </Box>
        </Box>
      </Box>

      {/* Success Dialog */}
      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>Login Successful</DialogTitle>
        <DialogContent>
          <Typography>Welcome back! You will be redirected to the home page.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;