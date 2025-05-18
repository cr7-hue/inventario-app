
import { useState } from "react";

// Recibe la prop toggleSidebar
export default function Header({ toggleSidebar }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 md:left-64 w-full md:w-[calc(100%-16rem)] h-20 bg-white/10 backdrop-blur flex items-center px-4 md:px-8 shadow z-30 justify-between md:justify-end">
      {/* Botón para alternar la sidebar - visible solo en pantallas pequeñas */}
      <button
        className="text-white text-2xl md:hidden" // Visible solo en móviles
        onClick={toggleSidebar} // Llama a toggleSidebar al hacer clic
      >
        ☰ {/* Ícono de hamburguesa simple */}
      </button>

      <div className="relative flex items-center gap-4">
        <span className="text-white font-medium hidden md:block">Usuario</span> {/* Oculta el texto "Usuario" en móviles */}
        <img
          src="https://i.pravatar.cc/40"
          alt="avatar"
          className="w-10 h-10 rounded-full border-2 border-blue-500 shadow cursor-pointer"
          onClick={() => setOpen(!open)}
        />
        {open && (
          <div className="absolute right-0 top-14 bg-white rounded shadow-lg py-2 w-40 z-50">
            <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Perfil</button>
            <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">Cerrar sesión</button>
          </div>
        )}
      </div>
    </header>
  );
}
