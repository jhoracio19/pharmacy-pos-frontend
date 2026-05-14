"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  const [medicines, setMedicines] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchMedicines = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/medicines/');
      const data = await res.json();
      setMedicines(data);
    } catch (error) {
      console.error("Error al cargar medicinas", error);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleBuy = async (medicineId) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await fetch('http://127.0.0.1:8001/process_sale/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medicine_id: medicineId, quantity: 1 })
      });

      if (res.ok) {
        alert("✅ Venta procesada y guardada en la base de datos.");
      } else {
        const errorData = await res.json();
        alert(`❌ Error: ${errorData.detail || 'No se pudo procesar la venta.'}`);
      }
    } catch (error) {
      console.error("Error al procesar la venta", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Terminal de Ventas</h1>
        <p className="text-zinc-500 mt-1">Selecciona los productos para cobrar.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {medicines.map((med) => (
          <div key={med.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-3 border border-emerald-200">
                Disponible
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 leading-tight mb-1">{med.name}</h2>
              <p className="text-sm text-zinc-500 mb-4">{med.active_ingredient}</p>
            </div>
            
            <div className="mt-4 pt-4 border-t border-zinc-100">
              <div className="text-2xl font-bold text-zinc-900 mb-4">${med.price}</div>
              <button 
                onClick={() => handleBuy(med.id)}
                disabled={isProcessing}
                className={`w-full py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition-all ${
                  isProcessing 
                    ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed' 
                    : 'bg-zinc-900 hover:bg-zinc-800 active:bg-black'
                }`}
              >
                {isProcessing ? 'Procesando...' : 'Cobrar 1 Unidad'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}