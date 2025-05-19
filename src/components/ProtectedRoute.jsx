import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../services/firebase';
import { useEffect, useState } from 'react';

export default function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div className="text-white text-center p-8">Verificando autenticación...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}