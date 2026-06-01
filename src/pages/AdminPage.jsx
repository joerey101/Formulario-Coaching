import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { SECCIONES, SECCIONES_ORDEN } from '../lib/respuestasSchema';
import { getFormularioConfig } from '../formularios/configs';
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
        .select(`
          *,
          asignaciones:asignacion_id (
            id,
            estado,
            habilitado,
            finalizado_at,
            finalizado_por,
            solicitud_reapertura_pendiente,
            coachee_user_id
          ),
          formularios:formulario_id (
            codigo,
            titulo
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      // Extract unique user_ids to fetch their coachee data
      const userIds = [...new Set(
        (data || [])
          .map(r => r.asignaciones?.coachee_user_id || r.user_id)
          .filter(Boolean)
      )];

      let coacheesDict = {};
      if (userIds.length > 0) {
        const { data: coacheesData, error: coacheesError } = await supabase
          .from('coachees')
          .select(`
            user_id,
            nombre,
            apellido,
            coach:coach_id (
              nombre,
              apellido
            )
          `)
          .in('user_id', userIds);

        if (!coacheesError && coacheesData) {
          coacheesDict = coacheesData.reduce((acc, c) => {
            acc[c.user_id] = {
              nombre: c.nombre,
              apellido: c.apellido,
              coach_nombre: c.coach?.nombre,
              coach_apellido: c.coach?.apellido
            };
            return acc;
          }, {});
        }
      }

      // Enrich respuestas with unified display properties
      const enrichedData = (data || []).map(r => {
        const uid = r.asignaciones?.coachee_user_id || r.user_id;
        const cData = coacheesDict[uid] || {};
        return {
          ...r,
          display_coachee_nombre: r.coachee_nombre || cData.nombre || '',
          display_coachee_apellido: r.coachee_apellido || cData.apellido || '',
          display_coach: r.coach || (cData.coach_nombre ? `${cData.coach_nombre} ${cData.coach_apellido}` : ''),
          display_etapa: r.formularios?.titulo || r.etapa || ''
        };
      });

      setRespuestas(enrichedData);
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
    if (!window.confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return;
    
    try {
      // Buscar la fila para obtener asignacion_id
      const fila = respuestas.find(r => r.id === id);
      const asignacionId = fila?.asignacion_id;
      
      console.log(`[ADMIN] Eliminando respuesta ${id} and asignación ${asignacionId}`);
      
      // 1. PRIMERO borrar respuestas (la tabla "hija")
      const { error: errorResp } = await supabase
        .from('respuestas')
        .delete()
        .eq('id', id);
      
      if (errorResp) {
        console.error('[ADMIN] Error eliminando respuesta:', errorResp);
        alert(`Error al eliminar respuesta: ${errorResp.message}`);
        return;
      }
      
      // 2. DESPUÉS borrar la asignación (si existe)
      if (asignacionId) {
        const { error: errorAsig } = await supabase
          .from('asignaciones')
          .delete()
          .eq('id', asignacionId);
        
        if (errorAsig) {
          console.warn('[ADMIN] Respuesta eliminada pero asignación quedó huérfana:', errorAsig);
          alert('Advertencia: registro eliminado parcialmente. Revisar manualmente la asignación.');
        }
      } else {
        console.warn('[ADMIN] La respuesta no tenía asignacion_id vinculado, no se eliminó asignación');
      }
      
      console.log('[ADMIN] Registro eliminado correctamente');
      await fetchData();
      setSelectedItem(null);
    } catch (err) {
      console.error('[ADMIN] Error inesperado al eliminar:', err);
      alert('Error inesperado al eliminar');
    }
  };

  const handleReabrir = async (id) => {
    if (!window.confirm('¿Seguro que querés reabrir este formulario? El coachee podrá volver a editar sus respuestas.')) return;
    
    try {
      // Buscar la fila en el state para obtener asignacion_id
      const fila = respuestas.find(r => r.id === id);
      if (!fila?.asignacion_id) {
        console.error('[ADMIN] No se encontró asignacion_id para la respuesta', id);
        alert('Error: no se puede reabrir, falta vincular la asignación.');
        return;
      }
      
      const asignacionId = fila.asignacion_id;
      
      console.log(`[ADMIN] Reabriendo formulario ${id} y asignación ${asignacionId}`);
      
      // 1. PRIMERO actualizar asignaciones (fuente de verdad)
      const { error: errorAsig } = await supabase
        .from('asignaciones')
        .update({
          estado: 'en_progreso',
          finalizado_at: null,
          finalizado_por: null,
          solicitud_reapertura_pendiente: false,
          solicitud_reapertura_nota: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', asignacionId);
      
      if (errorAsig) {
        console.error('[ADMIN] Error reabriendo asignación:', errorAsig);
        alert(`Error al reabrir: ${errorAsig.message}`);
        return; // ABORTAR: no tocar respuestas si asignaciones falla
      }
      
      // 2. DESPUÉS actualizar respuestas (coherencia)
      const { error: errorResp } = await supabase
        .from('respuestas')
        .update({
          estado: 'en_progreso',
          finalizado_at: null,
          finalizado_por: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (errorResp) {
        // No abortar: la fuente de verdad ya está OK
        console.warn('[ADMIN] Asignación reabierta pero respuestas quedó desincronizada:', errorResp);
      }
      
      console.log('[ADMIN] Formulario reabierto correctamente');
      
      // Refetch del listado
      await fetchData();
      
      alert('Formulario reabierto. El coachee ya puede modificar sus respuestas.');
      setSelectedItem(null);
    } catch (err) {
      console.error('[ADMIN] Error inesperado al reabrir:', err);
      alert('Error inesperado al reabrir');
    }
  };

  const handleExportCSV = () => {
    if (respuestas.length === 0) return;
    
    // Preparar cabeceras
    const headers = ['Fecha', 'Coachee', 'Email', 'Coach', 'Etapa', 'Satisfaccion General'];
    const rows = respuestas.map(r => [
      new Date(r.created_at).toLocaleDateString(),
      `${r.display_coachee_nombre} ${r.display_coachee_apellido}`.trim(),
      r.email,
      r.display_coach,
      r.display_etapa,
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
    `${r.display_coachee_nombre} ${r.display_coachee_apellido} ${r.email}`.toLowerCase().includes(searchTerm.toLowerCase())
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
                {filteredData.map(item => {
                  const itemEstado = item.asignaciones?.estado || item.estado || 'en_progreso';
                  return (
                    <tr key={item.id}>
                      <td>{new Date(item.created_at).toLocaleDateString()}</td>
                      <td><strong>{item.display_coachee_nombre} {item.display_coachee_apellido}</strong></td>
                      <td className="text-muted">{item.email}</td>
                      <td>{item.display_coach || '-'}</td>
                      <td><span className="badge">{item.display_etapa}</span></td>
                      <td>
                        <span className={`badge ${itemEstado === 'finalizado' ? 'badge--finalizado' : 'badge--en-progreso'}`}>
                          {itemEstado === 'finalizado' ? '🔒 Finalizado' : '✏️ En progreso'}
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
                  );
                })}
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
                <h2>{selectedItem.display_coachee_nombre} {selectedItem.display_coachee_apellido}</h2>
                <p className="subtitle">{selectedItem.email} · {selectedItem.display_etapa}</p>
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

              {(() => {
                const codigo = selectedItem.formularios?.codigo;
                
                // Path legacy: Yo Real-Actual (columnas individuales)
                if (!codigo || codigo === 'yo_real_actual') {
                  return SECCIONES_ORDEN.map(seccionKey => {
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
                  });
                }
                
                // Path genérico: formularios JSONB (Seteo de Objetivos y futuros)
                try {
                  const formConfig = getFormularioConfig(codigo);
                  const respuestas = selectedItem.respuestas_json || {};
                  
                  return formConfig.secciones.map(seccion => {
                    const camposConValor = seccion.grupos
                      .flatMap(g => g.campos.map(c => ({ ...c, grupoTitulo: g.titulo })))
                      .filter(c => respuestas[c.name]?.toString().trim());
                    
                    if (camposConValor.length === 0) return null;
                    
                    return (
                      <div key={seccion.id} className="seccion-respuestas">
                        <h3 className="seccion-titulo">{seccion.titulo}</h3>
                        {camposConValor.map(campo => (
                          <div key={campo.name} className="campo-respuesta">
                            <label className="campo-label">{campo.label}</label>
                            <div className="campo-valor">
                              <p className="texto-respuesta">{respuestas[campo.name]}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  });
                } catch (err) {
                  console.error('[ADMIN] Error cargando config para:', codigo, err);
                  return <p className="text-muted">No se pudo cargar la configuración del formulario.</p>;
                }
              })()}
            </div>
            <div className="modal-footer">
              {(selectedItem.asignaciones?.estado || selectedItem.estado || 'en_progreso') === 'finalizado' && (
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
