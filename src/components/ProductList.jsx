import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editCategory, setEditCategory] = useState('Herramientas');
  const [editNotes, setEditNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const cachedProducts = localStorage.getItem('products');
    if (cachedProducts) {
      setProducts(JSON.parse(cachedProducts));
    }

    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
      localStorage.setItem('products', JSON.stringify(productList));
      setIsOffline(false);
    }, (err) => {
      setError('Error al cargar los productos: ' + err.message);
      setIsOffline(true);
    });

    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      unsubscribe();
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
      } catch (err) {
        setError('Error al eliminar el producto: ' + err.message);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditName(product.name);
    setEditPrice(product.price.toString());
    setEditCategory(product.category || 'Herramientas');
    setEditNotes(product.notes || '');
  };

  const handleSave = async (id) => {
    if (!editName || !editPrice) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    if (isNaN(editPrice) || parseFloat(editPrice) <= 0) {
      setError('El precio debe ser un número positivo.');
      return;
    }

    try {
      await updateDoc(doc(db, 'products', id), {
        name: editName,
        price: parseFloat(editPrice),
        category: editCategory,
        notes: editNotes,
      });
      setEditingId(null);
      setEditName('');
      setEditPrice('');
      setEditCategory('Herramientas');
      setEditNotes('');
      setError(null);
    } catch (err) {
      setError('Error al guardar los cambios: ' + err.message);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const valueA = sortBy === 'name' ? a.name.toLowerCase() : a.price;
    const valueB = sortBy === 'name' ? b.name.toLowerCase() : b.price;
    if (sortOrder === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });

  const exportToCSV = () => {
    const headers = ['ID,Name,Price,Category,Notes,CreatedAt,Location'];
    const rows = sortedProducts.map((product) =>
      `${product.id},${product.name},${product.price.toFixed(2)},${product.category || ''},${product.notes || ''},${product.createdAt.toDate().toISOString()},${product.location ? `${product.location.lat},${product.location.lng}` : ''}`
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventario_products.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-2">Lista de Productos</h3>
      {isOffline && (
        <p className="text-yellow-500 mb-2">
          Estás offline. Mostrando datos guardados localmente.
        </p>
      )}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar por nombre..."
        className="border p-2 mb-4 w-full"
      />
      <div className="mb-4">
        <label className="mr-2">Ordenar por:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-1 mr-2"
        >
          <option value="name">Nombre</option>
          <option value="price">Precio</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border p-1"
        >
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>
        <button
          onClick={exportToCSV}
          className="bg-blue-500 text-white p-2 ml-4"
        >
          Exportar a CSV
        </button>
      </div>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {sortedProducts.length === 0 ? (
        <p>No hay productos que coincidan con la búsqueda.</p>
      ) : (
        <ul className="border rounded">
          {sortedProducts.map((product) => (
            <li key={product.id} className="p-2 border-b flex justify-between items-center">
              {editingId === product.id ? (
                <div className="w-full">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border p-1 mb-1 w-full"
                  />
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="border p-1 mb-1 w-full"
                  />
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="border p-1 mb-1 w-full"
                  >
                    <option value="Herramientas">Herramientas</option>
                    <option value="Alimentos">Alimentos</option>
                  </select>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="border p-1 mb-1 w-full"
                    rows="3"
                  />
                  <button
                    onClick={() => handleSave(product.id)}
                    className="bg-green-500 text-white p-1 mr-2"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-500 text-white p-1"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <span>
                    {product.name} - ${product.price.toFixed(2)} ({product.category})
                    {product.notes && <small className="block">{product.notes}</small>}
                    {product.location && (
                      <small className="block">
                        Lat: {product.location.lat.toFixed(6)}, Lng: {product.location.lng.toFixed(6)}
                      </small>
                    )}
                  </span>
                  <div>
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-yellow-500 text-white p-1 mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-red-500 text-white p-1"
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}