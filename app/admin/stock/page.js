"use client";
import { useState, useEffect } from 'react';

export default function StockDashboard() {
  const [stocks, setStocks] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState({ medicine_id: '', batch_number: '', quantity: '' });
  const [editingId, setEditingId] = useState(null);

  const STOCK_API_URL = 'http://127.0.0.1:8000/api/v1/stock/';
  const MEDICINE_API_URL = 'http://127.0.0.1:8000/api/v1/medicines/';

  const fetchData = async () => {
    const [stockRes, medRes] = await Promise.all([ fetch(STOCK_API_URL), fetch(MEDICINE_API_URL) ]);
    setStocks(await stockRes.json());
    setMedicines(await medRes.json());
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${STOCK_API_URL}${editingId}/` : STOCK_API_URL;
    const payload = { ...formData, quantity: parseInt(formData.quantity, 10) };

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setFormData({ medicine_id: '', batch_number: '', quantity: '' });
      setEditingId(null);
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Borrar permanentemente?")) return;
    const res = await fetch(`${STOCK_API_URL}${id}/`, { method: 'DELETE' });
    if (res.ok) fetchData();
  };

  const handleEditClick = (stock) => {
    setFormData({ medicine_id: stock.medicine_id, batch_number: stock.batch_number, quantity: stock.quantity });
    setEditingId(stock.id);
  };

  const getMedicineName = (uuid) => {
    const med = medicines.find(m => m.id === uuid);
    return med ? med.name : "Desconocida";
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Control de Lotes</h1>
        <p className="text-slate-500 mt-1">Registra la entrada física de cajas al almacén.</p>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {editingId ? "Modificando Lote" : "Ingreso de Lote"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Medicamento</label>
            <select required name="medicine_id" value={formData.medicine_id} onChange={handleChange} 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-all">
              <option value="" disabled>Selecciona producto...</option>
              {medicines.map(med => <option key={med.id} value={med.id}>{med.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Folio del Lote</label>
            <input required type="text" name="batch_number" value={formData.batch_number} onChange={handleChange} placeholder="Ej. L-4091"
                   className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-all" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Cajas Entrantes</label>
            <input required type="number" min="0" name="quantity" value={formData.quantity} onChange={handleChange} 
                   className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-all" />
          </div>
          <div className="md:col-span-1 flex space-x-2">
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-all">
              {editingId ? "Actualizar" : "Registrar"}
            </button>
            {editingId && (
              <button type="button" onClick={() => {setEditingId(null); setFormData({medicine_id:'', batch_number:'', quantity:''})}} 
                      className="bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg text-sm px-4 py-2.5 transition-all">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Producto Asociado</th>
              <th className="px-6 py-4 font-semibold">Código de Lote</th>
              <th className="px-6 py-4 font-semibold">Stock Actual</th>
              <th className="px-6 py-4 font-semibold text-right">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {stocks.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-400">Sin lotes en almacén</td></tr>
            ) : (
              stocks.map((stock) => (
                <tr key={stock.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{getMedicineName(stock.medicine_id)}</td>
                  <td className="px-6 py-4">{stock.batch_number}</td>
                  <td className="px-6 py-4 font-medium text-emerald-600">{stock.quantity} unidades</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEditClick(stock)} className="font-medium text-indigo-600 hover:text-indigo-800 mr-4">Editar</button>
                    <button onClick={() => handleDelete(stock.id)} className="font-medium text-red-600 hover:text-red-800">Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}