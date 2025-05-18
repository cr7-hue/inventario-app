import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot, deleteDoc, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';

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

  // Estado para el modal de agregar producto
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Herramientas');
  const [newNotes, setNewNotes] = useState('');
  const [addError, setAddError] = useState(null);

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

  // --- NUEVO: Función para agregar producto ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newName || !newPrice) {
      setAddError('Por favor, completa todos los campos.');
      return;
    }
    if (isNaN(newPrice) || parseFloat(newPrice) <= 0) {
      setAddError('El precio debe ser un número positivo.');
      return;
    }
    try {
      await addDoc(collection(db, 'products'), {
        name: newName,
        price: parseFloat(newPrice),
        category: newCategory,
        notes: newNotes,
        createdAt: serverTimestamp(),
      });
      setShowModal(false);
      setNewName('');
      setNewPrice('');
      setNewCategory('Herramientas');
      setNewNotes('');
      setAddError(null);
    } catch (err) {
      setAddError('Error al agregar el producto: ' + err.message);
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
      `${product.id},${product.name},${product.price.toFixed(2)},${product.category || ''},${product.notes || ''},${product.createdAt?.toDate?.().toISOString?.() || ''},${product.location ? `${product.location.lat},${product.location.lng}` : ''}`
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
    <>
      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 text-white">Lista de Productos</h3>
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
          className="border p-2 mb-4 w-full rounded"
        />
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <label className="mr-2 text-white">Ordenar por:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border p-1 rounded"
          >
            <option value="name">Nombre</option>
            <option value="price">Precio</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="border p-1 rounded"
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
          <button
            onClick={exportToCSV}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-all ml-auto"
          >
            Exportar a CSV
          </button>
        </div>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        {sortedProducts.length === 0 ? (
          <p className="text-white">No hay productos que coincidan con la búsqueda.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => (
              <li
                key={product.id}
                className="bg-white/20 backdrop-blur rounded-xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-200 border border-white/10 flex flex-col justify-between"
              >
                {editingId === product.id ? (
                  <div className="w-full">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border p-1 mb-1 w-full rounded"
                    />
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="border p-1 mb-1 w-full rounded"
                    />
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="border p-1 mb-1 w-full rounded"
                    >
                      <option value="Herramientas">Herramientas</option>
                      <option value="Alimentos">Alimentos</option>
                    </select>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="border p-1 mb-1 w-full rounded"
                      rows="3"
                    />
                    <button
                      onClick={() => handleSave(product.id)}
                      className="bg-green-500 hover:bg-green-600 text-white p-1 mr-2 rounded transition-all"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-500 hover:bg-gray-600 text-white p-1 rounded transition-all"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="text-xl font-bold text-white">{product.name}</span>
                      <span className="block text-blue-200 font-semibold">${product.price.toFixed(2)}</span>
                      <span className="block text-sm text-blue-100 mb-2">{product.category}</span>
                      {product.notes && <small className="block text-gray-200">{product.notes}</small>}
                      {product.location && (
                        <small className="block text-gray-300">
                          Lat: {product.location.lat.toFixed(6)}, Lng: {product.location.lng.toFixed(6)}
                        </small>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-all"
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

     
      {/* MODAL PARA AGREGAR PRODUCTO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 rounded-2xl shadow-2xl p-8 w-full max-w-md relative border border-blue-400">
            <button
              className="absolute top-2 right-2 text-blue-200 hover:text-white text-2xl font-bold"
              onClick={() => setShowModal(false)}
              title="Cerrar"
            >
              ×
            </button>
            <h2 className="text-2xl font-extrabold mb-4 text-white tracking-wide">Agregar Producto</h2>
            {addError && <p className="text-red-300 mb-2">{addError}</p>}
            <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre"
                className="border-none bg-blue-100/80 focus:bg-white focus:ring-2 focus:ring-blue-400 p-3 rounded-lg text-gray-900 font-semibold transition-all"
                required
              />
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Precio"
                className="border-none bg-blue-100/80 focus:bg-white focus:ring-2 focus:ring-blue-400 p-3 rounded-lg text-gray-900 font-semibold transition-all"
                required
                min="0"
                step="0.01"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="border-none bg-blue-100/80 focus:bg-white focus:ring-2 focus:ring-blue-400 p-3 rounded-lg text-gray-900 font-semibold transition-all"
              >
                <option value="Herramientas">Herramientas</option>
                <option value="Alimentos">Alimentos</option>
              </select>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Notas"
                className="border-none bg-blue-100/80 focus:bg-white focus:ring-2 focus:ring-blue-400 p-3 rounded-lg text-gray-900 font-semibold transition-all"
                rows="2"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg px-4 py-2 mt-2 font-bold shadow-md transition-all"
              >
                Agregar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BOTÓN FLOTANTE */}
      <button
        className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl shadow-lg transition-all"
        title="Agregar producto"
        onClick={() => setShowModal(true)}
      >
        +
      </button>
    </>
  );
}