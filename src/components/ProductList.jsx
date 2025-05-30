import { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot, deleteDoc, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';

// Componente MapWrapper para renderizar el mapa solo en el cliente
const MapWrapper = ({ lat, lng }) => {
  const [isClient, setIsClient] = useState(false);

  // Cargar CSS de Leaflet solo en el cliente
  useEffect(() => {
    setIsClient(true);
    import('leaflet/dist/leaflet.css');
  }, []);

  if (!isClient) return null;

  return (
    <div className="h-64 rounded-lg overflow-hidden">
      <MapContainer
        center={[lat, lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[lat, lng]}>
          <Popup>Ubicación actual</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Herramientas');
  const [editNotes, setEditNotes] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editPriceNotes, setEditPriceNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [isOffline, setIsOffline] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('Herramientas');
  const [newNotes, setNewNotes] = useState('');
  const [newPriceNotes, setNewPriceNotes] = useState('');
  const [addError, setAddError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [showMap, setShowMap] = useState(false);
  const navigate = useNavigate();

  const categories = [
    'Herramientas',
    'Alimentos',
    'Agua e Higiene',
    'Vivienda y Energía',
    'Ropa básica',
    'Tecnología',
    'Librería',
    'Muebles',
    'Farmacéutica',
    'Gimnasios',
    'Trabajos',
  ];

  useEffect(() => {
    console.log('Iniciando carga de productos');
    const cachedProducts = localStorage.getItem('products');
    if (cachedProducts) {
      console.log('Cargando desde localStorage:', JSON.parse(cachedProducts));
      setProducts(JSON.parse(cachedProducts));
    }

    const unsubscribe = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const productList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('Productos recibidos:', productList);
        setProducts(productList);
        localStorage.setItem('products', JSON.stringify(productList));
        setIsOffline(false);
        setError(null);
      },
      (err) => {
        console.error('Error al cargar productos:', err.code, err.message);
        setError(`Error al cargar productos: ${err.message}`);
        setIsOffline(true);
      }
    );

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

  useEffect(() => {
    if (showModal && navigator.geolocation) {
      console.log('Solicitando geolocalización');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Ubicación obtenida:', { lat: latitude, lng: longitude });
          setLocation({ lat: latitude, lng: longitude });
        },
        (err) => {
          console.error('Error de geolocalización:', err.message);
          setAddError('No se pudo obtener la ubicación: ' + err.message);
        }
      );
    }
  }, [showModal]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    console.log('Intentando agregar producto:', { newName, newPrice, newCategory, newNotes, newPriceNotes, location });
    if (!newName || !newPrice) {
      console.log('Campos vacíos');
      setAddError('Por favor, completa nombre y precio.');
      return;
    }
    if (isNaN(newPrice) || parseFloat(newPrice) <= 0) {
      console.log('Precio inválido');
      setAddError('El precio debe ser un número positivo.');
      return;
    }
    try {
      const newProduct = {
        name: newName,
        category: newCategory,
        notes: newNotes,
        createdAt: serverTimestamp(),
        isFavorite: false,
        prices: [
          {
            price: parseFloat(newPrice),
            location: location.lat && location.lng ? { lat: location.lat, lng: location.lng } : null,
            date: new Date().toISOString(),
            notes: newPriceNotes,
          },
        ],
        ...(auth.currentUser && { userId: auth.currentUser.uid }),
      };
      console.log('Enviando a Firestore:', newProduct);
      const docRef = await addDoc(collection(db, 'products'), newProduct);
      console.log('Producto agregado, ID:', docRef.id);
      setShowModal(false);
      setNewName('');
      setNewPrice('');
      setNewCategory('Herramientas');
      setNewNotes('');
      setNewPriceNotes('');
      setLocation({ lat: null, lng: null });
      setShowMap(false);
      setAddError(null);
      setSuccessMessage('¡Producto agregado con éxito!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error al agregar producto:', err.code, err.message);
      setAddError(`No se pudo agregar el producto: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        console.log('Producto eliminado, ID:', id);
      } catch (err) {
        console.error('Error al eliminar:', err.code, err.message);
        setError('Error al eliminar el producto: ' + err.message);
      }
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setEditName(product.name);
    setEditCategory(product.category || 'Herramientas');
    setEditNotes(product.notes || '');
    setEditPrice('');
    setEditPriceNotes('');
  };

  const handleSave = async (id) => {
    if (!editName) {
      setError('Por favor, completa el nombre.');
      return;
    }
    try {
      const updates = {
        name: editName,
        category: editCategory,
        notes: editNotes,
      };
      if (editPrice && !isNaN(editPrice) && parseFloat(editPrice) > 0) {
        updates.prices = [
          ...(products.find((p) => p.id === id)?.prices || []),
          {
            price: parseFloat(editPrice),
            location: location.lat && location.lng ? { lat: location.lat, lng: location.lng } : null,
            date: new Date().toISOString(),
            notes: editPriceNotes,
          },
        ];
      }
      await updateDoc(doc(db, 'products', id), updates);
      console.log('Producto actualizado, ID:', id);
      setEditingId(null);
      setEditName('');
      setEditCategory('Herramientas');
      setEditNotes('');
      setEditPrice('');
      setEditPriceNotes('');
      setError(null);
    } catch (err) {
      console.error('Error al guardar cambios:', err.code, err.message);
      setError('Error al guardar los cambios: ' + err.message);
    }
  };

  const toggleFavorite = async (id, currentFavorite) => {
    try {
      await updateDoc(doc(db, 'products', id), {
        isFavorite: !currentFavorite,
      });
      console.log('Favorito actualizado, ID:', id, 'isFavorite:', !currentFavorite);
    } catch (err) {
      console.error('Error al actualizar favorito:', err.code, err.message);
      setError('Error al marcar como favorito: ' + err.message);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'Todos' ||
      (categoryFilter === 'Favoritos' ? product.isFavorite : product.category === categoryFilter);
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const valueA = sortBy === 'name' ? a.name.toLowerCase() : getLatestPrice(a)?.price || 0;
    const valueB = sortBy === 'name' ? b.name.toLowerCase() : getLatestPrice(b)?.price || 0;
    return sortOrder === 'asc' ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
  });

  const getLatestPrice = (product) => {
    if (!product.prices || product.prices.length === 0) return null;
    return product.prices.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  };

  const getLowestPrice = (product) => {
    if (!product.prices || product.prices.length === 0) return null;
    return product.prices.reduce((min, p) => (p.price < min.price ? p : min), product.prices[0]);
  };

  const exportToCSV = () => {
    if (typeof window === 'undefined') return; // Evita ejecución en servidor
    const headers = ['ID,Nombre,Categoría,Notas,Favorito,Precio,Fecha,Ubicación Lat,Ubicación Lng,Notas Precio'];
    const rows = sortedProducts.flatMap((product) =>
      (product.prices || []).map((price) =>
        `${product.id},${product.name},${product.category || ''},${product.notes || ''},${
          product.isFavorite ? 'Sí' : 'No'
        },${price.price.toFixed(2)},${price.date || ''},${price.location?.lat || ''},${
          price.location?.lng || ''
        },${price.notes || ''}`
      )
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventario_productos.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h3 className="text-2xl font-bold mb-4 text-white">Lista de Productos</h3>
      {isOffline && (
        <p className="text-yellow-400 bg-yellow-900/50 p-2 rounded mb-4">
          Estás offline. Mostrando datos locales.
        </p>
      )}
      {error && (
        <p className="text-red-400 bg-red-900/50 p-2 rounded mb-4">{error}</p>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre..."
          className="border-none bg-gray-800/50 text-white placeholder-gray-400 p-3 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <div className="flex items-center gap-2">
          <label className="text-white text-sm">Filtrar:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border-none bg-gray-800/50 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="Todos">Todos</option>
            <option value="Favoritos">Favoritos</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-white text-sm">Ordenar por:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border-none bg-gray-800/50 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Nombre</option>
            <option value="price">Precio</option>
          </select>
        </div>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border-none bg-gray-800/50 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="asc">Ascendente</option>
          <option value="desc">Descendente</option>
        </select>
        <button
          onClick={exportToCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all ml-auto"
        >
          Exportar a CSV
        </button>
      </div>
      {sortedProducts.length === 0 ? (
        <p className="text-white bg-gray-800/50 p-4 rounded-lg">
          No hay productos que coincidan con la búsqueda.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProducts.map((product) => {
            const latestPrice = getLatestPrice(product);
            const lowestPrice = getLowestPrice(product);
            return (
              <li
                key={product.id}
                className="bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-700/50 flex flex-col justify-between transition-all hover:scale-105 hover:shadow-xl"
              >
                {editingId === product.id ? (
                  <div className="flex flex-col gap-3 w-full">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border-none bg-gray-700/50 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nombre"
                    />
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="border-none bg-gray-700/50 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      className="border-none bg-gray-700/50 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Notas generales"
                    />
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="border-none bg-gray-700/50 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nuevo precio (opcional)"
                      step="0.01"
                    />
                    <input
                      type="text"
                      value={editPriceNotes}
                      onChange={(e) => setEditPriceNotes(e.target.value)}
                      className="border-none bg-gray-700/50 text-white p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Notas del precio (ej. Feria X)"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(product.id)}
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg flex-1 transition-all"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg flex-1 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xl font-bold text-white truncate flex-1">
                          {product.name}
                        </span>
                        <button
                          onClick={() => toggleFavorite(product.id, product.isFavorite)}
                          className={`text-lg p-1 w-6 h-6 ${
                            product.isFavorite ? 'text-yellow-400' : 'text-gray-400'
                          } hover:text-yellow-300 transition-colors`}
                          title={product.isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                        >
                          {product.isFavorite ? '🌟' : '☆'}
                        </button>
                      </div>
                      {latestPrice ? (
                        <>
                          <span className="text-blue-300 font-semibold">
                            ${latestPrice.price.toFixed(2)}
                            {lowestPrice && lowestPrice.price < latestPrice.price && (
                              <span className="text-green-400 text-sm ml-2">
                                (Mín: ${lowestPrice.price.toFixed(2)})
                              </span>
                            )}
                          </span>
                          <span className="text-sm text-gray-300">{latestPrice.notes}</span>
                        </>
                      ) : (
                        <span className="text-gray-400">Sin precios</span>
                      )}
                      <span className="text-sm text-blue-200">{product.category}</span>
                      {product.notes && (
                        <small className="text-gray-300 line-clamp-3">{product.notes}</small>
                      )}
                      {latestPrice?.location && (
                        <small className="text-gray-300">
                          Ubicación: {latestPrice.location.lat.toFixed(4)},{' '}
                          {latestPrice.location.lng.toFixed(4)}
                        </small>
                      )}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => alert('Comparador de precios no implementado aún')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex-1 transition-all"
                        disabled={true}
                      >
                        Ver precios
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex-1 transition-all"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex-1 transition-all"
                      >
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-md sm:max-w-lg border border-gray-700">
            <button
              className="absolute top-4 right-4 text-gray-300 hover:text-white text-2xl font-bold"
              onClick={() => setShowModal(false)}
              title="Cerrar"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4 text-white">Agregar Producto</h2>
            {addError && (
              <p className="text-red-400 bg-red-900/50 p-2 rounded mb-4">{addError}</p>
            )}
            {successMessage && (
              <p className="text-green-400 bg-green-900/50 p-2 rounded mb-4">
                {successMessage}
              </p>
            )}
            <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre"
                className="border-none bg-gray-700/50 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                required
              />
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Precio"
                className="border-none bg-gray-700/50 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                required
                min="0"
                step="0.01"
              />
              <input
                type="text"
                value={newPriceNotes}
                onChange={(e) => setNewPriceNotes(e.target.value)}
                placeholder="Notas del precio (ej. Feria X)"
                className="border-none bg-gray-700/50 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="border-none bg-gray-700/50 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Notas generales"
                className="border-none bg-gray-700/50 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all"
                rows="3"
              />
              {location.lat && location.lng && (
                <p className="text-gray-300 text-sm">
                  Ubicación: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              )}
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-all"
              >
                {showMap ? 'Ocultar mapa' : 'Mostrar mapa'}
              </button>
              {showMap && location.lat && location.lng && (
                <MapWrapper lat={location.lat} lng={location.lng} />
              )}
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition-all"
              >
                Agregar
              </button>
            </form>
          </div>
        </div>
      )}
      <button
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center text-3xl shadow-lg transition-transform hover:scale-110"
        title="Agregar producto"
        onClick={() => setShowModal(true)}
      >
        +
      </button>
    </div>
  );
}