import Sidebar from './components/sidebar';
import Header from './components/Header';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('https://www.xtrafondos.com/wallpapers/montanas-con-nieve-en-el-bosque-3934.jpg')" }}>
        <div className="fixed inset-0 bg-black opacity-60 -z-10"></div>
        <Sidebar />
        <Header />
        <main className="ml-64 pt-24 p-8">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/home" element={<Home />} />
            </Route>
            <Route path="/" element={
              <p className="text-white">
                Selecciona una opción:{" "}
                <a href="/login" className="underline">Iniciar Sesión</a> |{" "}
                <a href="/register" className="underline">Registrarse</a>
              </p>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}