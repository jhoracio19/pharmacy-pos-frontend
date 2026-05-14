"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // 1. Mandamos las credenciales al backend real (Django)
      const res = await fetch('http://127.0.0.1:8000/api/v1/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        // 2. Guardamos el Token oficial y los datos del usuario
        localStorage.setItem('pharma_token', data.token);
        localStorage.setItem('pharma_user', JSON.stringify(data.user));
        
        // 3. Redirigimos según el rol real que nos dictó Django
        if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        setError(data.error || 'Ocurrió un error al iniciar sesión.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor. Verifica que Django esté corriendo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-sm border border-zinc-200">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-zinc-900 tracking-tight">
            Pharma<span className="text-zinc-400">POS</span>
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600">
            Ingresa al sistema de punto de venta (Conexión a BD)
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Usuario</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                placeholder="Ej. admin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-zinc-200 rounded-xl text-zinc-900 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm font-medium text-center bg-red-50 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white transition-all ${
              isLoading ? 'bg-zinc-400 cursor-wait' : 'bg-zinc-900 hover:bg-zinc-800 active:bg-black'
            }`}
          >
            {isLoading ? 'Autenticando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}