// src/pages/Home.jsx
import ProductList from '../components/ProductList';

export default function Home() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-white">Bienvenido a Inventario App</h2>
      <ProductList />
    </div>
  );
}