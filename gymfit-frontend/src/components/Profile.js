import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';
import { useNavigate } from 'react-router-dom';

const Profile = ({ user, onProfileUpdate }) => {
  const [profile, setProfile] = useState({ name: '', email: '', role: '' });
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  // Încarcă datele profilului utilizatorului curent
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5129/api/auth/me');
      setProfile({ name: res.data.name, email: res.data.email, role: res.data.role });
    } catch (err) {
      setError('Eroare la încărcarea profilului');
    } finally {
      setLoading(false);
    }
  };

  // Actualizează datele de profil (fără parolă)
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5129/api/users/${user.id}`, {
        name: profile.name,
        email: profile.email,
        role: profile.role
      });
      setSuccess('Profil actualizat cu succes!');
      setError('');
      if (onProfileUpdate) onProfileUpdate();
    } catch (err) {
      setError('Eroare la actualizarea profilului');
      setSuccess('');
    }
  };

  // Schimbă parola utilizatorului
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Parolele nu coincid!');
      setSuccess('');
      return;
    }
    try {
      await axios.put(`http://localhost:5129/api/users/${user.id}/password`, {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });
      setSuccess('Parola a fost schimbată cu succes!');
      setError('');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Eroare la schimbarea parolei');
      setSuccess('');
    }
  };

  if (loading) return <div className="profile-loading">Se încarcă profilul...</div>;

  return (
    <div className="profile-container">
      <button
        className="profile-btn"
        style={{ marginBottom: 16 }}
        onClick={() => navigate(profile.role === 'Admin' ? '/admin' : '/client')}
      >
        Înapoi la dashboard
      </button>
      <h2>Profilul meu</h2>
      {error && <div className="profile-error">{error}</div>}
      {success && <div className="profile-success">{success}</div>}
      <form className="profile-form" onSubmit={handleProfileUpdate}>
        <div className="form-group">
          <label>Nume:</label>
          <input
            type="text"
            value={profile.name}
            onChange={e => setProfile({ ...profile, name: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={profile.email}
            onChange={e => setProfile({ ...profile, email: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Rol:</label>
          <input type="text" value={profile.role} disabled />
        </div>
        <button type="submit" className="profile-save-btn">Salvează modificările</button>
      </form>

      <h3>Schimbă parola</h3>
      <form className="profile-form" onSubmit={handlePasswordChange}>
        <div className="form-group">
          <label>Parola veche:</label>
          <input
            type="password"
            value={passwords.oldPassword}
            onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Parola nouă:</label>
          <input
            type="password"
            value={passwords.newPassword}
            onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirmă parola nouă:</label>
          <input
            type="password"
            value={passwords.confirmPassword}
            onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
            required
          />
        </div>
        <button type="submit" className="profile-save-btn">Schimbă parola</button>
      </form>
    </div>
  );
};

export default Profile; 