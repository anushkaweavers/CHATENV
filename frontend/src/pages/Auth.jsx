import { Routes, Route, Outlet } from 'react-router-dom';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';

const Auth = () => {
  return (
    <div className="auth-container">
      <Outlet />
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route index element={<Login />} />
      </Routes>
    </div>
  );
};

export default Auth;