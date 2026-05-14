import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './AdminPage.css';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [respuestas, setRespuestas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    if (user === 'JOrtiz' && pass === 'Poder2026!') {
      setIsAuthenticated(true);
      fetchData();
    } else {
      alert('Credenciales incorrectas');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('respuestas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setRespuestas(data || []);
    } catch (err) {
      console.error('Error cargando datos:', err);
      alert('Error al cargar datos de Supabase');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que querés eliminar este registro?')) return;
    try {
      const { error } = await supabase.from('respuestas').delete().eq('id', id);
      if (error) {
        alert(`Error de base de datos: ${error.message}. Probablemente necesites habilitar los permisos de DELETE en Supabase.`);
        return;
      }
      setRespuestas(respuestas.filter(r => r.id !== id));
    } catch (err) {
      alert('Error inesperado al eliminar');
    }
  };

  const filteredData = respuestas.filter(r => 
    `${r.coachee_nombre} ${r.coachee_apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <form className="card login-card" onSubmit={handleLogin}>
          <div className="logo-text">ADMIN · CONSCIENCIA</div>
          <h2>Panel de Control</h2>
          <div className="form-group">
            <label>Usuario</label>
            <input type="text" value={user} onChange={e => setUser(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={pass} onChange={e => setPass(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary">Ingresar al Sistema</button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-content">
          <h1>Gestión de Coachees</h1>
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Buscar por nombre..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="btn-logout">Cerrar Sesión</button>
        </div>
      </header>

      <main className="admin-main">
        {loading ? (
          <div className="loading-state">Cargando datos...</div>
        ) : (
          <div className="card table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Coachee</th>
                  <th>Coach</th>
                  <th>Etapa</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(item => (
                  <tr key={item.id}>
                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td><strong>{item.coachee_nombre} {item.coachee_apellido}</strong></td>
                    <td>{item.coach || '-'}</td>
                    <td><span className="badge">{item.etapa}</span></td>
                    <td style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-view" onClick={() => setSelectedItem(item)}>
                        Ver Detalle
                      </button>
                      <button className="btn-view" style={{ color: 'var(--rose)', borderColor: 'var(--rose)' }} onClick={() => handleDelete(item.id)}>
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredData.length === 0 && <div className="empty-state">No se encontraron registros.</div>}
          </div>
        )}
      </main>

      {/* Modal de Detalle */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Respuestas de {selectedItem.coachee_nombre}</h2>
              <button className="btn-close" onClick={() => setSelectedItem(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Metadatos</h3>
                <div className="meta-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                  <p><strong>Fecha:</strong> {selectedItem.fecha}</p>
                  <p><strong>Coach:</strong> {selectedItem.coach}</p>
                  <p><strong>Etapa:</strong> {selectedItem.etapa}</p>
                </div>
              </div>

              <div className="detail-section">
                <h3>Respuestas del Formulario</h3>
                {Object.entries(selectedItem.respuestas || {}).length > 0 ? (
                  Object.entries(selectedItem.respuestas).map(([key, value]) => (
                    <div key={key} className="answer-item">
                      <span className="answer-label">
                        {key.replace(/_/g, ' ')} 
                        {key.includes('_score') && <span className="score-badge">{value}/10</span>}
                      </span>
                      {!key.includes('_score') && <div className="answer-value">{value}</div>}
                    </div>
                  ))
                ) : (
                  <p>No hay respuestas detalladas guardadas.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
