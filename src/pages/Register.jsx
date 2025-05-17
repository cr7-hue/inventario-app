import { useState } from 'react';
import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleRegister = async () => {
    // Validar campos
    if (!email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, ingresa un correo válido.');
      return;
    }

    console.log('Intentando registrar:', { email, password }); // Log para depurar

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error de Firebase:', err); // Log para ver el error completo
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Registrarse</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Correo"
        className="border p-2 mb-2 w-full"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        className="border p-2 mb-2 w-full"
      />
      <button onClick={handleRegister} className="bg-blue-500 text-white p-2">
        Registrarse
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}