import { useState, useEffect } from 'react';
import Sidebar from './components/sidebar';
import Header from './components/Header';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import { auth } from './services/firebase';

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
    return <div className="min-h-screen flex items-center justify-center text-white">Cargando...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://www.xtrafondos.com/wallpapers/montanas-con-nieve-en-el-bosque-3934.jpg')" }}>
        <div className="fixed inset-0 bg-black opacity-60 -z-10"></div>
        {user && (
          <>
            <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <Header isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          </>
        )}
        <main className={`pt-24 p-8 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/home" /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/home" /> : <Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<Home />} />
            </Route>
            <Route path="/" element={
              user ? <Navigate to="/home" /> : (
                <div className="text-center mt-20">
                  <p className="text-white text-xl mb-4">
                    Selecciona una opción:
                  </p>
                  <div className="flex gap-4 justify-center">
                    <a href="/login" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg text-lg transition-colors">
                      Iniciar Sesión
                    </a>
                    <a href="/register" className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-lg transition-colors">
                      Registrarse
                    </a>
                  </div>
                </div>
              )
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}