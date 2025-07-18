import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import ClientDashboard from './components/ClientDashboard';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Profile from './components/Profile';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verifică dacă utilizatorul este autentificat la încărcarea aplicației
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Setează token-ul pentru toate cererile axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Obține informațiile utilizatorului
      axios.get('http://localhost:5129/api/auth/me')
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          // Token invalid, șterge din localStorage
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5129/api/auth/login', {
        email,
        password
      });
      
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const handleRegister = async (name, email, password, role) => {
    try {
      const response = await axios.post('http://localhost:5129/api/auth/register', {
        name,
        email,
        password,
        role
      });
      
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Register failed:", error);
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Se încarcă...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Rute publice */}
          <Route 
            path="/login" 
            element={
              user ? (
                <Navigate to={user.role === 'Admin' ? '/admin' : '/client'} replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/register" 
            element={
              user ? (
                <Navigate to={user.role === 'Admin' ? '/admin' : '/client'} replace />
              ) : (
                <Register onRegister={handleRegister} />
              )
            } 
          />

          {/* Rute protejate pentru Client */}
          <Route 
            path="/client" 
            element={
              <ProtectedRoute user={user} requiredRole="Client">
                <ClientDashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />

          {/* Rute protejate pentru Admin */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute user={user} requiredRole="Admin">
                <AdminDashboard user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />

          {/* Rute protejate pentru Profil */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute user={user} requiredRole={user ? user.role : undefined}>
                <Profile user={user} onProfileUpdate={() => {}} />
              </ProtectedRoute>
            } 
          />

          {/* Redirectare implicită */}
          <Route 
            path="/" 
            element={
              user ? (
                <Navigate to={user.role === 'Admin' ? '/admin' : '/client'} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;