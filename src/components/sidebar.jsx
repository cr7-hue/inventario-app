import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { auth } from '../services/firebase';

export default function Sidebar({ isOpen, onClose }) {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserEmail(user.email);
    }
  }, []);

  return (
    <>
      {/* Sidebar con comportamiento independiente */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-lg z-40 transform transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Inventario App</h2>
            <button 
              onClick={onClose}
              className="text-white md:hidden"
            >
              ✖
            </button>
          </div>
          <p className="text-sm text-gray-300 truncate">{userEmail}</p>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <NavLink 
                to="/home" 
                className={({ isActive }) => 
                  `block px-4 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                  }`
                }
                onClick={onClose}
              >
                Inicio
              </NavLink>
            </li>
            {/* Resto de enlaces... */}
          </ul>
        </nav>
      </aside>
    </>
  );
}