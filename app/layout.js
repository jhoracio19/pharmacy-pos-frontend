import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Farmacia POS',
  description: 'Punto de Venta e Inventario',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen font-sans">
        {/* BARRA DE NAVEGACIÓN SUPERIOR */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <span className="text-xl font-bold tracking-tight text-indigo-600">
                  PharmaPOS
                </span>
                <div className="hidden md:flex space-x-1">
                  <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition">
                    Punto de Venta
                  </Link>
                  <Link href="/admin" className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition">
                    Catálogo
                  </Link>
                  <Link href="/admin/stock" className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition">
                    Inventario Físico
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* CONTENIDO DE LAS PÁGINAS */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}