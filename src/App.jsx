import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './services/firebase';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Cargando...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        {user && <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />}
        {user && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
        
        {/* Contenido principal */}
        <main className="pt-16" >
          <div className="p-4">
            <Routes>
              <Route path="/login" element={user ? <Navigate to="/home" /> : <Login />} />
              <Route path="/register" element={user ? <Navigate to="/home" /> : <Register />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/home" element={<Home />} />
              </Route>
              <Route path="/" element={user ? <Navigate to="/home" /> : <Navigate to="/login" />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}