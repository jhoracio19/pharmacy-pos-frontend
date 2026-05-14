"use client";
import { useState, useEffect } from 'react';

export default function Home() {
  const [medicines, setMedicines] = useState([]);
  const [stocks, setStocks] = useState([]);
  
  // --- NUEVO ESTADO PARA EL CARRITO ---
  const [cart, setCart] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchInventory = async () => {
    try {
      const [medRes, stockRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/v1/medicines/'),
        fetch('http://127.0.0.1:8000/api/v1/stock/')
      ]);
      setMedicines(await medRes.json());
      setStocks(await stockRes.json());
    } catch (error) {
      console.error("Error al cargar inventario", error);
    }
  };

  useEffect(() => {
    fetchInventory();
    const interval = setInterval(fetchInventory, 3000);
    return () => clearInterval(interval);
  }, []);

  const getMedicineStock = (medId) => {
    return stocks
      .filter(s => s.medicine_id === medId)
      .reduce((sum, s) => sum + Number(s.quantity), 0);
  };

  // --- LÓGICA DEL CARRITO ---
  const addToCart = (med, maxStock) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === med.id);
      if (existingItem) {
        if (existingItem.quantity >= maxStock) {
          alert(`Límite de stock: Solo hay ${maxStock} cajas disponibles.`);
          return prevCart;
        }
        return prevCart.map(item => 
          item.id === med.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...med, quantity: 1, maxStock }];
    });
  };

  const removeFromCart = (medId) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== medId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // --- LÓGICA DE COBRO MÚLTIPLE ---
  const handleCheckout = async () => {
    if (cart.length === 0 || isProcessing) return;
    setIsProcessing(true);

    let hasErrors = false;

    // Procesamos cada producto del carrito a través del Microservicio
    for (const item of cart) {
      try {
        const res = await fetch('http://127.0.0.1:8001/process_sale/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ medicine_id: item.id, quantity: item.quantity })
        });

        if (!res.ok) {
          hasErrors = true;
          const errorData = await res.json();
          alert(`Error con ${item.name}: ${errorData.detail}`);
        }
      } catch (error) {
        hasErrors = true;
        console.error(`Error procesando ${item.name}`, error);
      }
    }

    if (!hasErrors) {
      alert("Ticket cobrado exitosamente. Inventario actualizado.");
      setCart([]); // Vaciamos el carrito tras el cobro
      fetchInventory(); // Refrescamos la pantalla
    } else {
      alert("El cobro terminó, pero hubo problemas con algunos productos.");
      fetchInventory();
    }

    setIsProcessing(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Terminal de Ventas</h1>
        <p className="text-zinc-500 mt-1">Añade productos al ticket y cobra el total.</p>
      </div>

      {/* DISEÑO A DOS COLUMNAS: CATÁLOGO Y CARRITO */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* COLUMNA IZQUIERDA: CATÁLOGO */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicines.map((med) => {
            const totalStock = getMedicineStock(med.id);
            const cartItem = cart.find(item => item.id === med.id);
            // El stock disponible es el stock real menos lo que ya tienes en el carrito
            const stockAvailable = totalStock - (cartItem ? cartItem.quantity : 0);
            const hasStock = stockAvailable > 0;

            return (
              <div key={med.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                <div>
                  {hasStock ? (
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-3 border border-emerald-200">
                      Disponible: {stockAvailable} cajas
                    </div>
                  ) : (
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 mb-3 border border-red-200">
                      Sin más unidades
                    </div>
                  )}

                  <h2 className="text-lg font-semibold text-zinc-900 leading-tight mb-1">{med.name}</h2>
                  <p className="text-sm text-zinc-500 mb-4">{med.active_ingredient}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-zinc-100">
                  <div className="text-2xl font-bold text-zinc-900 mb-4">${med.price}</div>
                  
                  <button 
                    onClick={() => addToCart(med, totalStock)}
                    disabled={!hasStock || isProcessing}
                    className={`w-full py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium transition-all ${
                      !hasStock 
                        ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' 
                        : 'bg-zinc-900 hover:bg-zinc-800 active:bg-black text-white'
                    }`}
                  >
                    {!hasStock ? 'Agotado' : 'Añadir al Carrito'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* COLUMNA DERECHA: CARRITO DE COMPRAS FIJO */}
        <div className="w-full lg:w-[380px]">
          <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold text-zinc-900 mb-4 flex items-center">
              Ticket de Venta
            </h2>

            {cart.length === 0 ? (
              <div className="text-center py-10 text-zinc-400 text-sm border-2 border-dashed border-zinc-100 rounded-xl">
                El ticket está vacío. <br/> Añade productos para comenzar.
              </div>
            ) : (
              <div className="space-y-4">
                <ul className="divide-y divide-zinc-100 max-h-60 overflow-y-auto pr-2">
                  {cart.map(item => (
                    <li key={item.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-zinc-900 text-sm">{item.name}</p>
                        <p className="text-xs text-zinc-500">Cant: {item.quantity} x ${item.price}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-zinc-800">${(item.price * item.quantity).toFixed(2)}</span>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 font-bold p-1"
                          title="Eliminar"
                        >
                          ✕
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-zinc-200 pt-4">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-semibold text-zinc-600">Total a cobrar:</span>
                    <span className="text-2xl font-bold text-emerald-600">${cartTotal.toFixed(2)}</span>
                  </div>

                  <button 
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className={`w-full py-3.5 px-4 rounded-xl shadow-lg text-base font-bold text-white transition-all ${
                      isProcessing 
                        ? 'bg-zinc-400 cursor-wait' 
                        : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
                    }`}
                  >
                    {isProcessing ? 'Procesando Pagos...' : 'Confirmar Venta'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}