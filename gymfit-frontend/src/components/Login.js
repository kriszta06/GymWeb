import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userData = await onLogin(formData.email, formData.password);
      
      // Dacă trebuie să schimbe parola, redirect către profil
      if (userData.mustChangePassword) {
        navigate('/profile');
        return;
      }
      // Redirecționează pe baza rolului
      if (userData.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/client');
      }
    } catch (err) {
      setError(err.response?.data || 'Date de login incorecte');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Autentificare GymFit</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-input"
            required
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Parolă:</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="form-input"
            required
            autoComplete="current-password"
          />
        </div>

        <button 
          type="submit" 
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? 'Se încarcă...' : 'Autentificare'}
        </button>
      </form>

      <div className="register-link">
        Nu ai cont? <Link to="/register">Înregistrează-te</Link>
      </div>
    </div>
  );
};

export default Login;