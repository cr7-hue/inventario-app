import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';

export default function Home() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Bienvenido a Inventario App</h2>
      <ProductForm />
      <ProductList />
      <button onClick={handleLogout} className="bg-red-500 text-white p-2 mt-4">
        Cerrar sesión
      </button>
    </div>
  );
}