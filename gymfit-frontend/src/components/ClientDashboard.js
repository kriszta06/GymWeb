import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClientDashboard.css';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = ({ user, onLogout }) => {
  const [trainers, setTrainers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('trainers');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trainersRes, classesRes, bookingsRes] = await Promise.all([
        axios.get('http://localhost:5129/api/trainers'),
        axios.get('http://localhost:5129/api/classes'),
        axios.get('http://localhost:5129/api/bookings')
      ]);

      setTrainers(trainersRes.data);
      setClasses(classesRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      setError('Eroare la încărcarea datelor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookClass = async (classId) => {
    try {
      await axios.post('http://localhost:5129/api/bookings', {
        classId: classId
      });
      
      // Reîncarcă programările
      const bookingsRes = await axios.get('http://localhost:5129/api/bookings');
      setBookings(bookingsRes.data);
      
      alert('Programare realizată cu succes!');
    } catch (err) {
      alert(err.response?.data || 'Eroare la programare');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.delete(`http://localhost:5129/api/bookings/${bookingId}`);
      
      // Reîncarcă programările
      const bookingsRes = await axios.get('http://localhost:5129/api/bookings');
      setBookings(bookingsRes.data);
      
      alert('Programare anulată cu succes!');
    } catch (err) {
      alert('Eroare la anularea programării');
    }
  };

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('ro-RO');
  };

  if (loading) {
    return <div className="loading">Se încarcă...</div>;
  }

  return (
    <div className="client-dashboard">
      <header className="dashboard-header">
        <h1>GymFit - Dashboard Client</h1>
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
          Clase Disponibile
        </button>
        <button 
          className={activeTab === 'bookings' ? 'active' : ''} 
          onClick={() => setActiveTab('bookings')}
        >
          Programările Mele
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'trainers' && (
          <div className="trainers-section">
            <h2>Traineri Disponibili</h2>
            <div className="trainers-grid">
              {trainers.map(trainer => (
                <div key={trainer.id} className="trainer-card">
                  <h3>{trainer.name}</h3>
                  <p><strong>Specializare:</strong> {trainer.specialization}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="classes-section">
            <h2>Clase Disponibile</h2>
            <div className="classes-grid">
              {classes.map(classItem => {
                const isBooked = bookings.some(booking => booking.classId === classItem.id);
                return (
                  <div key={classItem.id} className="class-card">
                    <h3>{classItem.name}</h3>
                    <p><strong>Descriere:</strong> {classItem.description}</p>
                    <p><strong>Data și ora:</strong> {formatDateTime(classItem.dateTime)}</p>
                    <p><strong>Trainer:</strong> {classItem.trainer?.name}</p>
                    {isBooked ? (
                      <button className="booked-btn" disabled>
                        Programat
                      </button>
                    ) : (
                      <button 
                        className="book-btn"
                        onClick={() => handleBookClass(classItem.id)}
                      >
                        Programează-te
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <h2>Programările Mele</h2>
            {bookings.length === 0 ? (
              <p>Nu ai programări active.</p>
            ) : (
              <div className="bookings-grid">
                {bookings.map(booking => (
                  <div key={booking.id} className="booking-card">
                    <h3>{booking.class?.name}</h3>
                    <p><strong>Data și ora:</strong> {formatDateTime(booking.class?.dateTime)}</p>
                    <p><strong>Trainer:</strong> {booking.class?.trainer?.name}</p>
                    <p><strong>Programat la:</strong> {formatDateTime(booking.createdAt)}</p>
                    <button 
                      className="cancel-btn"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Anulează Programarea
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard; 