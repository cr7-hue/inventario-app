// src/components/sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom'; // Aseguramos useNavigate
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('Usuario deslogueado');
      navigate('/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err.code, err.message);
    }
  };

  return (
    <div className="w-64 bg-gray-800/70 text-white flex flex-col p-6 min-h-screen">
      <h2 className="text-2xl font-bold mb-8">Inventario</h2>
      <nav className="flex flex-col gap-4">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `p-3 rounded-lg transition-colors ${
              isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-700'
            }`
          }
        >
          Home
        </NavLink>
        <button
          onClick={handleLogout}
          className="p-3 rounded-lg text-left hover:bg-gray-700 transition-colors"
        >
          Logout
        </button>
      </nav>
    </div>
  );
}