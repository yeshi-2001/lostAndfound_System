import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Terms from './components/Terms';
import AboutUs from './components/AboutUs';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import FoundItemForm from './components/FoundItemForm';
import LostItemForm from './components/LostItemForm';
import Profile from './components/Profile';
import Matches from './components/Matches';
import Verification from './components/Verification';
import ItemCleanup from './components/ItemCleanup';
import Notifications from './components/Notifications';
import MyItems from './components/MyItems';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import './App.css';

function AppContent() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const location = useLocation();

  useEffect(() => {
    if (token) {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const showSidebar = user && !['/login', '/register', '/terms', '/forgot-password', '/home'].includes(location.pathname) && !location.pathname.startsWith('/reset-password');

  return (
    <div className="App">
      {showSidebar && <Sidebar user={user} onLogout={logout} />}
      {user && !showSidebar && location.pathname !== '/home' && <Navbar user={user} onLogout={logout} />}
        
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login onLogin={login} /> : <Navigate to="/home" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register onLogin={login} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/terms" 
            element={<Terms />} 
          />
          <Route 
            path="/about-us" 
            element={<AboutUs />} 
          />
          <Route 
            path="/forgot-password" 
            element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/reset-password/:token" 
            element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/home" 
            element={<Home user={user} onLogout={logout} />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/found-item" 
            element={user ? <FoundItemForm token={token} user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/lost-item" 
            element={user ? <LostItemForm token={token} user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile user={user} token={token} onLogout={logout} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/matches" 
            element={user ? <Matches user={user} token={token} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/verification/:matchId" 
            element={user ? <Verification token={token} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/cleanup" 
            element={user ? <ItemCleanup user={user} token={token} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/notifications" 
            element={user ? <Notifications user={user} token={token} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/my-items" 
            element={user ? <MyItems user={user} token={token} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
          />
        </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;