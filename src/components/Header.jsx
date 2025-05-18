// src/components/Header.jsx
import { useState } from 'react';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
      console.log('Sesión cerrada correctamente');
    } catch (err) {
      console.error('Error al cerrar sesión:', err.message);
    }
  };

  return (
    <header className="fixed top-0 left-64 w-[calc(100%-16rem)] h-20 bg-gray-800/70 backdrop-blur-sm flex items-center px-8 shadow z-30 justify-end">
      <div className="relative flex items-center gap-4">
        <span className="text-white font-medium">Usuario</span>
        <img
          src="https://i.pravatar.cc/40"
          alt="avatar"
          className="w-10 h-10 rounded-full border-2 border-blue-500 shadow cursor-pointer"
          onClick={() => setOpen(!open)}
        />
        {open && (
          <div className="absolute right-0 top-14 bg-gray-700 rounded-lg shadow-lg py-2 w-40 z-50">
            <button className="block w-full text-left px-4 py-2 text-white hover:bg-gray-600 transition-all">
              Perfil
            </button>
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-white hover:bg-gray-600 transition-all"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}