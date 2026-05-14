"use client";
import './globals.css'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function RootLayout({ children }) {
  const [user, setUser] = useState(null);
  const [isMicroserviceAlive, setIsMicroserviceAlive] = useState(true);
  const [isMounted, setIsMounted] = useState(false); 
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    const session = localStorage.getItem('pharma_user');
    
    if (session) {
      const parsedUser = JSON.parse(session);
      setUser(parsedUser);
      
      // Si un CAJERO intenta entrar a rutas de ADMIN, lo sacamos
      if (pathname.startsWith('/admin') && parsedUser.role !== 'admin') {
        router.push('/');
      }
    } else {
      // Si no hay sesión, lo mandamos a loguearse
      if (pathname !== '/login') {
        router.push('/login');
      }
    }
    
    // Health Check
    const checkHealth = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8001/health/');
        setIsMicroserviceAlive(res.ok);
      } catch (error) {
        setIsMicroserviceAlive(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('pharma_user');
    localStorage.removeItem('pharma_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <html lang="es">
      <body className="bg-zinc-50 text-zinc-900 antialiased min-h-screen font-sans">
        
        {!isMounted ? (
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-zinc-500 font-medium animate-pulse">Cargando sistema...</p>
          </div>
        ) : pathname === '/login' ? (
          children
        ) : (
          <>
            <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-sm">
              <div className="max-w-6xl mx-auto px-6">
                <div className="flex justify-between h-16 items-center">
                  
                  <div className="flex items-center space-x-8">
                    <span className="text-xl font-bold tracking-tight text-zinc-900">
                      Pharma<span className="text-zinc-400">POS</span>
                    </span>
                    
                    <div className="hidden md:flex space-x-2">
                      <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition">
                        Punto de Venta
                      </Link>
                      {user?.role === 'admin' && (
                        <>
                          <Link href="/admin/dashboard" className="px-3 py-2 rounded-md text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition">
                            Dashboard
                          </Link>
                          <Link href="/admin" className="px-3 py-2 rounded-md text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition">
                            Catálogo
                          </Link>
                          <Link href="/admin/stock" className="px-3 py-2 rounded-md text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition">
                            Inventario
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 text-sm font-medium">
                      <span className="text-zinc-500">Ventas:</span>
                      {isMicroserviceAlive ? (
                        <span className="flex items-center text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> Activo</span>
                      ) : (
                        <span className="flex items-center text-red-600"><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span> Caído</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 border-l border-zinc-200 pl-6">
                      <div className="text-sm text-right">
                        <p className="font-semibold text-zinc-900">{user?.name}</p>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">{user?.role}</p>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded-lg font-medium transition-all"
                      >
                        Salir
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </nav>
            
            <main className="max-w-6xl mx-auto px-6 py-8">
              {!isMicroserviceAlive && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center shadow-sm">
                  <span className="text-xl mr-3">⚠️</span>
                  <div>
                    <strong className="block font-semibold">Alerta Crítica:</strong>
                    <span className="text-sm">El microservicio de ventas está inactivo.</span>
                  </div>
                </div>
              )}
              {children}
            </main>
          </>
        )}
      </body>
    </html>
  );
}