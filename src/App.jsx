import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <div className="bg-blue-500 text-white p-4">
        <h1 className="text-3xl font-bold">¡Inventario App!</h1>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
          </Route>
          <Route path="/" element={<p>Selecciona una opción: <a href="/login" className="underline">Iniciar Sesión</a> | <a href="/register" className="underline">Registrarse</a></p>} />
        </Routes>
      </div>
    </Router>
  );
}