import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ user, requiredRole, children }) => {
  // Dacă nu există utilizator, redirectează la login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Dacă utilizatorul nu are rolul necesar, redirectează la pagina corespunzătoare
  if (user.role !== requiredRole) {
    return <Navigate to={user.role === 'Admin' ? '/admin' : '/client'} replace />;
  }

  // Dacă utilizatorul are rolul corect, afișează componenta
  return children;
};

export default ProtectedRoute; 