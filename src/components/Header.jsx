import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function Header({ toggleSidebar }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gray-900/80 backdrop-blur flex items-center px-4 z-30 shadow-md">
      {/* Botón Hamburguesa */}
      <button 
        onClick={toggleSidebar}
        className="mr-4 text-white focus:outline-none md:hidden"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <h1 className="text-xl font-bold text-white">Inventario App</h1>
      
      <div className="ml-auto relative">
        <button 
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-white focus:outline-none"
          aria-label="User menu"
        >
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
            {auth.currentUser?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </button>
        
        {open && (
          <div className="absolute right-0 top-12 bg-gray-800 rounded-md shadow-lg py-1 w-48 z-50 border border-gray-700">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}