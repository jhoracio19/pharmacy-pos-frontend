"use client";
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState({ name: '', active_ingredient: '', price: '' });
  const [editingId, setEditingId] = useState(null);

  const API_URL = 'http://127.0.0.1:8000/api/v1/medicines/';

  const fetchMedicines = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setMedicines(data);
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_URL}${editingId}/` : API_URL;

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setFormData({ name: '', active_ingredient: '', price: '' });
      setEditingId(null);
      fetchMedicines();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Borrar permanentemente?")) return;
    const res = await fetch(`${API_URL}${id}/`, { method: 'DELETE' });
    if (res.ok) fetchMedicines();
  };

  const handleEditClick = (medicine) => {
    setFormData({ name: medicine.name, active_ingredient: medicine.active_ingredient, price: medicine.price });
    setEditingId(medicine.id);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Catálogo Maestro</h1>
        <p className="text-slate-500 mt-1">Gestiona la base de datos de medicamentos.</p>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {editingId ? "Editando Medicamento" : "Añadir Nuevo Medicamento"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Comercial</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} 
                   className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-all" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Fórmula (Activo)</label>
            <input required type="text" name="active_ingredient" value={formData.active_ingredient} onChange={handleChange} 
                   className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-all" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Precio de Venta ($)</label>
            <input required type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} 
                   className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 outline-none transition-all" />
          </div>
          <div className="md:col-span-1 flex space-x-2">
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg text-sm px-5 py-2.5 transition-all">
              {editingId ? "Guardar Cambios" : "Añadir"}
            </button>
            {editingId && (
              <button type="button" onClick={() => {setEditingId(null); setFormData({name:'', active_ingredient:'', price:''})}} 
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
              <th className="px-6 py-4 font-semibold">Producto</th>
              <th className="px-6 py-4 font-semibold">Ingrediente Activo</th>
              <th className="px-6 py-4 font-semibold">Precio Público</th>
              <th className="px-6 py-4 font-semibold text-right">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((med) => (
              <tr key={med.id} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{med.name}</td>
                <td className="px-6 py-4">{med.active_ingredient}</td>
                <td className="px-6 py-4 font-medium text-indigo-600">${med.price}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEditClick(med)} className="font-medium text-indigo-600 hover:text-indigo-800 mr-4">Editar</button>
                  <button onClick={() => handleDelete(med.id)} className="font-medium text-red-600 hover:text-red-800">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}