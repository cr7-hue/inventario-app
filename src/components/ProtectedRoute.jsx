import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../services/firebase';
import { useEffect, useState } from 'react';

export default function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user); // true si hay usuario, false si no
    });
    return () => unsubscribe(); // Limpia el listener al desmontar
  }, []);

  if (isAuthenticated === null) {
    return <div>Cargando...</div>; // Mostrar algo mientras se verifica
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}