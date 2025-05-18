import { Link } from "react-router-dom";

// Recibe la prop isSidebarOpen
export default function Sidebar({ isSidebarOpen }) {
  return (
    // Ajusta las clases para responsive y visibilidad
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-gray-900 shadow-lg z-40 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} // Oculta por defecto en móviles
        md:translate-x-0 // Siempre visible en md y superiores
      `}
    >
      <div className="flex items-center justify-center h-20 border-b border-gray-800">
        <span className="text-white text-2xl font-bold">Inventario</span>
      </div>
      <nav className="mt-10 flex flex-col">
        <Link
          to="/home"
          className="text-gray-300 hover:bg-gray-800 hover:text-white px-6 py-3 transition-all duration-200 rounded hover:scale-105"
        >
          Inicio
        </Link>
        <Link
          to="#"
          className="text-gray-300 hover:bg-gray-800 hover:text-white px-6 py-3 transition-all duration-200 rounded hover:scale-105"
        >
          Nosotros
        </Link>
        <Link
          to="#"
          className="text-gray-300 hover:bg-gray-800 hover:text-white px-6 py-3 transition-all duration-200 rounded hover:scale-105"
        >
          Blog
        </Link>
        <Link
          to="#"
          className="text-gray-300 hover:bg-gray-800 hover:text-white px-6 py-3 transition-all duration-200 rounded hover:scale-105"
        >
          Contacto
        </Link>
      </nav>
    </aside>
  );
}
