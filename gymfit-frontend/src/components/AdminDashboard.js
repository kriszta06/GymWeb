import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ user, onLogout }) => {
  const [trainers, setTrainers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('trainers');
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  // Form states
  const [trainerForm, setTrainerForm] = useState({ name: '', specialization: '' });
  const [classForm, setClassForm] = useState({ 
    name: '', 
    description: '', 
    dateTime: '', 
    trainerId: '' 
  });
  const [userForm, setUserForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role: 'Client' 
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trainersRes, classesRes, usersRes, bookingsRes] = await Promise.all([
        axios.get('http://localhost:5129/api/trainers'),
        axios.get('http://localhost:5129/api/classes'),
        axios.get('http://localhost:5129/api/users'),
        axios.get('http://localhost:5129/api/bookings')
      ]);

      setTrainers(trainersRes.data);
      setClasses(classesRes.data);
      setUsers(usersRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      setError('Eroare la încărcarea datelor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Trainer operations
  const handleAddTrainer = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5129/api/trainers', trainerForm);
      setTrainerForm({ name: '', specialization: '' });
      setShowForm(false);
      fetchData();
      alert('Trainer adăugat cu succes!');
    } catch (err) {
      alert('Eroare la adăugarea trainerului');
    }
  };

  const handleEditTrainer = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5129/api/trainers/${editingItem.id}`, trainerForm);
      setTrainerForm({ name: '', specialization: '' });
      setEditingItem(null);
      setShowForm(false);
      fetchData();
      alert('Trainer actualizat cu succes!');
    } catch (err) {
      alert('Eroare la actualizarea trainerului');
    }
  };

  const handleDeleteTrainer = async (id) => {
    if (window.confirm('Ești sigur că vrei să ștergi acest trainer?')) {
      try {
        await axios.delete(`http://localhost:5129/api/trainers/${id}`);
        fetchData();
        alert('Trainer șters cu succes!');
      } catch (err) {
        alert('Eroare la ștergerea trainerului');
      }
    }
  };

  // Class operations
  const handleAddClass = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5129/api/classes', classForm);
      setClassForm({ name: '', description: '', dateTime: '', trainerId: '' });
      setShowForm(false);
      fetchData();
      alert('Clasă adăugată cu succes!');
    } catch (err) {
      alert(err.response?.data || 'Eroare la adăugarea clasei');
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    try {
      // Asigură-te că data trimisă este în format ISO UTC și include id-ul
      const classData = { ...classForm, id: editingItem.id };
      if (classData.dateTime && !classData.dateTime.endsWith('Z')) {
        classData.dateTime = new Date(classData.dateTime).toISOString();
      }
      await axios.put(`http://localhost:5129/api/classes/${editingItem.id}`, classData);
      setClassForm({ name: '', description: '', dateTime: '', trainerId: '' });
      setEditingItem(null);
      setShowForm(false);
      fetchData();
      alert('Clasă actualizată cu succes!');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || err.message || 'Eroare la actualizarea clasei';
      alert(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  const handleDeleteClass = async (id) => {
    if (window.confirm('Ești sigur că vrei să ștergi această clasă?')) {
      try {
        await axios.delete(`http://localhost:5129/api/classes/${id}`);
        fetchData();
        alert('Clasă ștearsă cu succes!');
      } catch (err) {
        alert('Eroare la ștergerea clasei');
      }
    }
  };

  // User operations
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5129/api/users', userForm);
      setUserForm({ name: '', email: '', password: '', role: 'Client' });
      setShowForm(false);
      fetchData();
      if (res.data.password) {
        setTempPassword(res.data.password);
      } else {
        alert('Utilizator adăugat cu succes!');
      }
    } catch (err) {
      alert(err.response?.data || 'Eroare la adăugarea utilizatorului');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      // Nu trimite parola la editare
      const { password, ...userData } = userForm;
      await axios.put(`http://localhost:5129/api/users/${editingItem.id}`, userData);
      setUserForm({ name: '', email: '', password: '', role: 'Client' });
      setEditingItem(null);
      setShowForm(false);
      fetchData();
      alert('Utilizator actualizat cu succes!');
    } catch (err) {
      alert('Eroare la actualizarea utilizatorului');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Ești sigur că vrei să ștergi acest utilizator?')) {
      try {
        await axios.delete(`http://localhost:5129/api/users/${id}`);
        fetchData();
        alert('Utilizator șters cu succes!');
      } catch (err) {
        alert('Eroare la ștergerea utilizatorului');
      }
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('ro-RO');
  };

  const openForm = (type, item = null) => {
    setEditingItem(item);
    setShowForm(true);
    
    if (item) {
      if (type === 'trainer') {
        setTrainerForm({ name: item.name, specialization: item.specialization });
      } else if (type === 'class') {
        // Asigură-te că dateTime e compatibil cu input type="datetime-local"
        let localDateTime = item.dateTime;
        if (localDateTime) {
          const d = new Date(localDateTime);
          // Format YYYY-MM-DDTHH:mm pentru input
          localDateTime = d.toISOString().slice(0, 16);
        }
        setClassForm({ 
          name: item.name, 
          description: item.description, 
          dateTime: localDateTime, 
          trainerId: item.trainerId 
        });
      } else if (type === 'user') {
        setUserForm({ 
          name: item.name, 
          email: item.email, 
          password: '', 
          role: item.role 
        });
      }
    } else {
      setTrainerForm({ name: '', specialization: '' });
      setClassForm({ name: '', description: '', dateTime: '', trainerId: '' });
      setUserForm({ name: '', email: '', password: '', role: 'Client' });
    }
  };

  // Modal pentru parola temporară
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(tempPassword);
  };

  if (loading) {
    return <div className="loading">Se încarcă...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>GymFit - Dashboard Administrator</h1>
        <div className="user-info">
          <span>Bună, {user.name}!</span>
          <button onClick={() => navigate('/profile')} className="profile-btn">Profilul meu</button>
          <button onClick={onLogout} className="logout-btn">Deconectare</button>
        </div>
      </header>

      {error && <div className="error-message">{error}</div>}

      <nav className="dashboard-nav">
        <button 
          className={activeTab === 'trainers' ? 'active' : ''} 
          onClick={() => setActiveTab('trainers')}
        >
          Traineri
        </button>
        <button 
          className={activeTab === 'classes' ? 'active' : ''} 
          onClick={() => setActiveTab('classes')}
        >
          Clase
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          Utilizatori
        </button>
        <button 
          className={activeTab === 'bookings' ? 'active' : ''} 
          onClick={() => setActiveTab('bookings')}
        >
          Programări
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'trainers' && (
          <div className="trainers-section">
            <div className="section-header">
              <h2>Gestionare Traineri</h2>
              <button onClick={() => openForm('trainer')} className="add-btn">
                Adaugă Trainer
              </button>
            </div>
            <div className="items-grid">
              {trainers.map(trainer => (
                <div key={trainer.id} className="item-card">
                  <h3>{trainer.name}</h3>
                  <p><strong>Specializare:</strong> {trainer.specialization}</p>
                  <div className="card-actions">
                    <button onClick={() => openForm('trainer', trainer)} className="edit-btn">
                      Editează
                    </button>
                    <button onClick={() => handleDeleteTrainer(trainer.id)} className="delete-btn">
                      Șterge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="classes-section">
            <div className="section-header">
              <h2>Gestionare Clase</h2>
              <button onClick={() => openForm('class')} className="add-btn">
                Adaugă Clasă
              </button>
            </div>
            <div className="items-grid">
              {classes.map(classItem => (
                <div key={classItem.id} className="item-card">
                  <h3>{classItem.name}</h3>
                  <p><strong>Descriere:</strong> {classItem.description}</p>
                  <p><strong>Data și ora:</strong> {formatDateTime(classItem.dateTime)}</p>
                  <p><strong>Trainer:</strong> {classItem.trainer?.name}</p>
                  <div className="card-actions">
                    <button onClick={() => openForm('class', classItem)} className="edit-btn">
                      Editează
                    </button>
                    <button onClick={() => handleDeleteClass(classItem.id)} className="delete-btn">
                      Șterge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-section">
            <div className="section-header">
              <h2>Gestionare Utilizatori</h2>
              <button onClick={() => openForm('user')} className="add-btn">
                Adaugă Utilizator
              </button>
            </div>
            <div className="items-grid">
              {users.map(userItem => (
                <div key={userItem.id} className="item-card">
                  <h3>{userItem.name}</h3>
                  <p><strong>Email:</strong> {userItem.email}</p>
                  <p><strong>Rol:</strong> {userItem.role}</p>
                  <div className="card-actions">
                    <button onClick={() => handleDeleteUser(userItem.id)} className="delete-btn">
                      Șterge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <h2>Toate Programările</h2>
            <div className="items-grid">
              {bookings.map(booking => (
                <div key={booking.id} className="item-card">
                  <h3>{booking.class?.name}</h3>
                  <p><strong>Client:</strong> {booking.user?.name}</p>
                  <p><strong>Data și ora:</strong> {formatDateTime(booking.class?.dateTime)}</p>
                  <p><strong>Trainer:</strong> {booking.class?.trainer?.name}</p>
                  <p><strong>Programat la:</strong> {formatDateTime(booking.createdAt)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modal pentru formulare */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                {editingItem ? 'Editează' : 'Adaugă'} 
                {activeTab === 'trainers' ? ' Trainer' : 
                 activeTab === 'classes' ? ' Clasă' : ' Utilizator'}
              </h3>
              <button onClick={() => setShowForm(false)} className="close-btn">&times;</button>
            </div>
            <form onSubmit={
              activeTab === 'trainers' ? (editingItem ? handleEditTrainer : handleAddTrainer) :
              activeTab === 'classes' ? (editingItem ? handleEditClass : handleAddClass) :
              (editingItem ? handleEditUser : handleAddUser)
            }>
              {activeTab === 'trainers' && (
                <>
                  <div className="form-group">
                    <label>Nume:</label>
                    <input
                      type="text"
                      value={trainerForm.name}
                      onChange={(e) => setTrainerForm({...trainerForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Specializare:</label>
                    <input
                      type="text"
                      value={trainerForm.specialization}
                      onChange={(e) => setTrainerForm({...trainerForm, specialization: e.target.value})}
                      required
                    />
                  </div>
                </>
              )}

              {activeTab === 'classes' && (
                <>
                  <div className="form-group">
                    <label>Nume:</label>
                    <input
                      type="text"
                      value={classForm.name}
                      onChange={(e) => setClassForm({...classForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Descriere:</label>
                    <textarea
                      value={classForm.description}
                      onChange={(e) => setClassForm({...classForm, description: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Data și ora:</label>
                    <input
                      type="datetime-local"
                      value={classForm.dateTime}
                      onChange={(e) => setClassForm({...classForm, dateTime: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Trainer:</label>
                    <select
                      value={classForm.trainerId}
                      onChange={(e) => setClassForm({...classForm, trainerId: e.target.value})}
                      required
                    >
                      <option value="">Selectează trainer</option>
                      {trainers.map(trainer => (
                        <option key={trainer.id} value={trainer.id}>
                          {trainer.name} - {trainer.specialization}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'users' && (
                <>
                  <div className="form-group">
                    <label>Nume:</label>
                    <input
                      type="text"
                      value={userForm.name}
                      onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email:</label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Rol:</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                      required
                    >
                      <option value="Client">Client</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </>
              )}

              <div className="form-actions">
                <button type="submit" className="save-btn">
                  {editingItem ? 'Actualizează' : 'Adaugă'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="cancel-btn">
                  Anulează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal pentru parola temporară */}
      {tempPassword && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Parolă temporară generată</h3>
            <p style={{fontSize: '1.2em', fontWeight: 'bold', wordBreak: 'break-all'}}>{tempPassword}</p>
            <button onClick={handleCopyPassword} className="profile-btn" style={{marginRight: 8}}>Copiază parola</button>
            <button onClick={() => setTempPassword('')} className="logout-btn">Închide</button>
            <p style={{marginTop: 10, fontSize: '0.95em', color: '#555'}}>Trimite această parolă utilizatorului pe un canal securizat.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 