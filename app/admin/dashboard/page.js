"use client";
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stocks, setStocks] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [recentSales, setRecentSales] = useState([]);

  // Endpoints Oficiales
  const STOCK_API_URL = 'http://127.0.0.1:8000/api/v1/stock/';
  const MEDICINE_API_URL = 'http://127.0.0.1:8000/api/v1/medicines/';
  const SALES_API_URL = 'http://127.0.0.1:8000/api/v1/sales/';

  const fetchData = async () => {
    try {
      const [stockRes, medRes, salesRes] = await Promise.all([
        fetch(STOCK_API_URL), 
        fetch(MEDICINE_API_URL),
        fetch(SALES_API_URL)
      ]);
      setStocks(await stockRes.json());
      setMedicines(await medRes.json());
      
      const salesData = await salesRes.json();
      setRecentSales(salesData.slice(0, 5)); // Mostramos solo las últimas 5 reales
    } catch (error) {
      console.error("Error al cargar el dashboard", error);
    }
  };

  useEffect(() => { 
    fetchData(); 
    // Actualizador automático cada 3 segundos para la presentación
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Lógica matemática corregida: suma todas las cajas de una medicina
  const outOfStockMedicines = medicines.filter(med => {
    const totalStock = stocks
      .filter(s => s.medicine_id === med.id)
      .reduce((sum, s) => sum + Number(s.quantity), 0);
    return totalStock <= 0;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Dashboard General</h1>
        <p className="text-zinc-500 mt-1">Resumen operativo y alertas del sistema.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PANEL DE ALERTAS DE STOCK */}
        <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center">
            <span className="mr-2"></span> Alertas de Inventario Crítico
          </h2>
          {outOfStockMedicines.length === 0 ? (
            <p className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
              Todo en orden. No hay productos agotados.
            </p>
          ) : (
            <ul className="space-y-3">
              {outOfStockMedicines.map(med => (
                <li key={med.id} className="flex justify-between items-center p-3 bg-red-50 border border-red-100 rounded-lg">
                  <span className="font-medium text-red-800">{med.name}</span>
                  <span className="text-xs font-bold bg-red-200 text-red-900 px-2 py-1 rounded">AGOTADO</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* PANEL DE VENTAS REALES */}
        <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-800 mb-4 flex items-center">
            <span className="mr-2"></span> Últimas Ventas (En Vivo)
          </h2>
          <div className="overflow-hidden rounded-lg border border-zinc-100">
            <table className="w-full text-sm text-left">
              <thead className="bg-zinc-50 text-zinc-600">
                <tr>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Cant.</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-4 text-center text-zinc-400">No hay ventas registradas aún.</td>
                  </tr>
                ) : (
                  recentSales.map(sale => (
                    <tr key={sale.id} className="border-t border-zinc-100">
                      <td className="p-3 font-medium text-zinc-800">
                        {sale.medicine_name} <br/>
                        <span className="text-xs text-zinc-400">
                          {new Date(sale.created_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="p-3">{sale.quantity}</td>
                      <td className="p-3 text-right font-semibold text-emerald-600">${sale.total}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}