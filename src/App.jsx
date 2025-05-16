import { useEffect } from 'react';
import { useState } from 'react'
import { db } from './services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

// function App() {
  // const [count, setCount] = useState(0)
// 
  // return (
    // <>
      {/* <div> */}
        {/* <a href="https://vite.dev" target="_blank"> */}
          {/* <img src={viteLogo} className="logo" alt="Vite logo" /> */}
        {/* </a> */}
        {/* <a href="https://react.dev" target="_blank"> */}
          {/* <img src={reactLogo} className="logo react" alt="React logo" /> */}
        {/* </a> */}
      {/* </div> */}
      {/* <h1>Vite + React</h1> */}
      {/* <div className="card"> */}
        {/* <button onClick={() => setCount((count) => count + 1)}> */}
          {/* count is {count} */}
        {/* </button> */}
        {/* <p> */}
          {/* Edit <code>src/App.jsx</code> and save to test HMR */}
        {/* </p> */}
      {/* </div> */}
      {/* <p className="read-the-docs"> */}
        {/* Click on the Vite and React logos to learn more */}
      {/* </p> */}
    {/* </> */}
  // )
// }
// 
export default function App() {
  useEffect(() => {
    const testFirebase = async () => {
      try {
        await addDoc(collection(db, 'test'), { message: 'Hola Firebase!' });
        console.log('Documento agregado a Firestore');
      } catch (error) {
        console.error('Error al conectar con Firebase:', error);
      }
    };
    testFirebase();
  }, []);

  return (
    <div className="bg-blue-500 text-white p-4">
      <h1 className="text-3xl font-bold">¡Inventario App!</h1>
    </div>
  );
}
