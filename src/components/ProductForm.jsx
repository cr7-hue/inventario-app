import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function ProductForm() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Herramientas');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Marca que estamos en el cliente
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          setError('No se pudo obtener la ubicación: ' + err.message);
        }
      );
    } else {
      setError('Geolocalización no soportada por este navegador.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    if (isNaN(price) || parseFloat(price) <= 0) {
      setError('El precio debe ser un número positivo.');
      return;
    }

    try {
      await addDoc(collection(db, 'products'), {
        name,
        price: parseFloat(price),
        category,
        notes,
        createdAt: new Date(),
        location: location.lat && location.lng ? location : null,
      });
      setName('');
      setPrice('');
      setCategory('Herramientas');
      setNotes('');
      setError(null);
      alert('Producto agregado con éxito!');
    } catch (err) {
      setError('Error al agregar el producto: ' + err.message);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-2">Agregar Producto</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del producto"
          className="border p-2 w-full rounded"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Precio"
          className="border p-2 w-full rounded"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 w-full rounded"
        >
          <option value="Herramientas">Herramientas</option>
          <option value="Alimentos">Alimentos</option>
        </select>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas (opcional)"
          className="border p-2 w-full rounded"
          rows="3"
        />
        {isClient && (
          <p className="text-sm">
            Ubicación: {location.lat && location.lng
              ? `Lat: ${location.lat.toFixed(6)}, Lng: ${location.lng.toFixed(6)}`
              : 'Obteniendo ubicación...'}
          </p>
        )}
        <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors duration-200">
          Agregar
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </form>
    </div>
  );
}