import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { SECCIONES, SECCIONES_ORDEN } from '../lib/respuestasSchema';
import './AdminPage.css';

export default function AdminPage() {
  const { coachData, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [respuestas, setRespuestas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este registro?')) return;
    try {
      const { error } = await supabase.from('respuestas').delete().eq('id', id);
      if (error) {
        alert(`Error de base de datos: ${error.message}`);
        return;
      }
      setRespuestas(respuestas.filter(r => r.id !== id));
    } catch (err) {
      alert('Error inesperado al eliminar');
    }
  };

  const handleReabrir = async (id) => {
    if (!window.confirm('¿Seguro que querés reabrir este formulario? El coachee podrá volver a editar sus respuestas.')) return;
    try {
      console.log(`[ADMIN] Reabriendo formulario ${id}`);
      const { error } = await supabase
        .from('respuestas')
        .update({ estado: 'en_progreso', finalizado_at: null, finalizado_por: null })
        .eq('id', id);
          
      if (error) {
        alert(`Error al reabrir: ${error.message}`);
        return;
      }
      
      alert('Formulario reabierto exitosamente.');
      setRespuestas(respuestas.map(r => r.id === id ? { ...r, estado: 'en_progreso', finalizado_at: null, finalizado_por: null } : r));
      setSelectedItem(null);
    } catch (err) {
      alert('Error inesperado al reabrir');
    }
  };

  const handleExportCSV = () => {
    if (respuestas.length === 0) return;
    
    // Preparar cabeceras
    const headers = ['Fecha', 'Coachee', 'Email', 'Coach', 'Etapa', 'Satisfaccion General'];
    const rows = respuestas.map(r => [
      new Date(r.created_at).toLocaleDateString(),
      `${r.coachee_nombre} ${r.coachee_apellido}`,
      r.email,
      r.coach,
      r.etapa,
      r.respuestas?.satisfaccion_general_score || ''
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_coaching_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const filteredData = respuestas.filter(r => 
    `${r.coachee_nombre} ${r.coachee_apellido} ${r.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-content">
          <div className="brand-group">
            <span className="brand-dot"></span>
            <div>
              <h1>Panel de Coach</h1>
              {coachData && (
                <p className="subtitle" style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  {coachData.nombre} {coachData.apellido}
                </p>
              )}
            </div>
          </div>
          <div className="actions-group">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Buscar coachee o email..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={handleExportCSV} className="btn-secondary">Exportar CSV</button>
            <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
          </div>
        </div>
      </header>

      <main className="admin-main">
        <div className="stats-grid">
          <div className="stat-card card">
            <span className="stat-label">Total Respuestas</span>
            <span className="stat-value">{respuestas.length}</span>
          </div>
          <div className="stat-card card">
            <span className="stat-label">Este Mes</span>
            <span className="stat-value">
              {respuestas.filter(r => new Date(r.created_at).getMonth() === new Date().getMonth()).length}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Cargando datos...</div>
        ) : (
          <div className="card table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Coachee</th>
                  <th>Email</th>
                  <th>Coach</th>
                  <th>Etapa</th>
                  <th>Estado</th>
                  <th>Score Gral.</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map(item => (
                  <tr key={item.id}>
                    <td>{new Date(item.created_at).toLocaleDateString()}</td>
                    <td><strong>{item.coachee_nombre} {item.coachee_apellido}</strong></td>
                    <td className="text-muted">{item.email}</td>
                    <td>{item.coach || '-'}</td>
                    <td><span className="badge">{item.etapa}</span></td>
                    <td>
                      <span className={`badge ${item.estado === 'finalizado' ? 'badge--finalizado' : 'badge--en-progreso'}`}>
                        {item.estado === 'finalizado' ? '🔒 Finalizado' : '✏️ En progreso'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="score-pill">
                        {item.respuestas?.satisfaccion_general_score || '-'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button className="btn-icon" title="Ver Detalle" onClick={() => setSelectedItem(item)}>👁️</button>
                      <button className="btn-icon delete" title="Borrar" onClick={() => handleDelete(item.id)}>🗑️</button>
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
              <div>
                <h2>{selectedItem.coachee_nombre} {selectedItem.coachee_apellido}</h2>
                <p className="subtitle">{selectedItem.email} · {selectedItem.etapa}</p>
              </div>
              <button className="btn-close" onClick={() => setSelectedItem(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Información de Sesión</h3>
                <div className="info-grid">
                  <div className="info-item"><label>Fecha:</label> <span>{selectedItem.fecha}</span></div>
                  <div className="info-item"><label>Coach:</label> <span>{selectedItem.coach}</span></div>
                  <div className="info-item"><label>ID Usuario:</label> <span className="mono">{selectedItem.user_id}</span></div>
                </div>
              </div>

              {SECCIONES_ORDEN.map(seccionKey => {
                const seccion = SECCIONES[seccionKey];
                const camposConValor = seccion.campos.filter(c => {
                  const val = selectedItem.respuestas?.[c.key];
                  return val !== undefined && val !== null && val !== '';
                });
                
                if (camposConValor.length === 0) return null;
                
                return (
                  <div key={seccionKey} className="seccion-respuestas">
                    <h3 className="seccion-titulo">{seccion.titulo}</h3>
                    <p className="seccion-descripcion">{seccion.descripcion}</p>
                    {camposConValor.map(campo => (
                      <div key={campo.key} className="campo-respuesta">
                        <label className="campo-label">{campo.label}</label>
                        <div className="campo-valor">
                          {campo.tipo === 'score' ? (
                            <div className="score-bar-container">
                              <div className="score-bar" style={{ width: `${selectedItem.respuestas[campo.key] * 10}%` }}></div>
                              <span className="score-text">{selectedItem.respuestas[campo.key]} / 10</span>
                            </div>
                          ) : campo.tipo === 'lista' ? (
                            <div className="lista-tags">
                              {(selectedItem.respuestas[campo.key] || []).map((item, i) => (
                                <span key={i} className="tag-item">{item}</span>
                              ))}
                            </div>
                          ) : (
                            <p className="texto-respuesta">{selectedItem.respuestas[campo.key]}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <div className="modal-footer">
              {selectedItem.estado === 'finalizado' && (
                <button 
                  onClick={() => handleReabrir(selectedItem.id)} 
                  className="btn-reabrir"
                >
                  Reabrir Formulario
                </button>
              )}
              <button onClick={() => setSelectedItem(null)} className="btn-primary">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
