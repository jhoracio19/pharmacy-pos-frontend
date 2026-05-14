"use client";
import './globals.css'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function RootLayout({ children }) {
  // Simulador de Roles para la entrega
  const [role, setRole] = useState('admin'); // Puede ser 'admin' o 'cajero'
  const [isMicroserviceAlive, setIsMicroserviceAlive] = useState(true);

  // Health Check: Monitorear FastAPI cada 5 segundos
  useEffect(() => {
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
  }, []);

  return (
    <html lang="es">
      <body className="bg-zinc-50 text-zinc-900 antialiased min-h-screen font-sans">
        <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex justify-between h-16 items-center">
              
              <div className="flex items-center space-x-8">
                <span className="text-xl font-bold tracking-tight text-zinc-900">
                  Pharma<span className="text-zinc-400">POS</span>
                </span>
                
                {/* Enlaces según el Rol */}
                <div className="hidden md:flex space-x-2">
                  <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition">
                    Punto de Venta
                  </Link>
                  {role === 'admin' && (
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

              {/* Status y Switcher de Roles */}
              <div className="flex items-center space-x-6">
                {/* Indicador del Microservicio */}
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <span className="text-zinc-500">Ventas:</span>
                  {isMicroserviceAlive ? (
                    <span className="flex items-center text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> Activo</span>
                  ) : (
                    <span className="flex items-center text-red-600"><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span> Caído</span>
                  )}
                </div>

                {/* Simulador de Rol */}
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="bg-zinc-100 border-none text-sm rounded-lg focus:ring-zinc-500 py-1.5 px-3 cursor-pointer outline-none"
                >
                  <option value="admin">Rol: Administrador</option>
                  <option value="cajero">Rol: Cajero</option>
                </select>
              </div>

            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Alerta global si el microservicio cae */}
          {!isMicroserviceAlive && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center shadow-sm">
              <span className="text-xl mr-3"></span>
              <div>
                <strong className="block font-semibold">Alerta Crítica:</strong>
                <span className="text-sm">El microservicio de ventas está inactivo. Los cobros están temporalmente deshabilitados.</span>
              </div>
            </div>
          )}
          {children}
        </main>
      </body>
    </html>
  )
}