import React from 'react';
import { useForm } from '../../context/FormContext';

export default function DatosIniciales() {
  const { state, setMeta, esReadonly } = useForm();

  return (
    <section className="card panel">
      <h2>Datos iniciales</h2>
      <div className="meta-grid">
        <div>
          <label htmlFor="coachee_nombre">Nombre</label>
          <input 
            id="coachee_nombre" 
            type="text" 
            value={state.meta.coachee_nombre || ''} 
            onChange={(e) => setMeta('coachee_nombre', e.target.value)} 
            placeholder="Nombre" 
            disabled={esReadonly}
          />
        </div>
        <div>
          <label htmlFor="coachee_apellido">Apellido</label>
          <input 
            id="coachee_apellido" 
            type="text" 
            value={state.meta.coachee_apellido || ''} 
            onChange={(e) => setMeta('coachee_apellido', e.target.value)} 
            placeholder="Apellido" 
            disabled={esReadonly}
          />
        </div>
      </div>
      <div className="meta-grid" style={{ marginTop: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 0.5fr))' }}>
        <div>
          <label htmlFor="coach_name">Coach</label>
          <input 
            id="coach_name" 
            type="text" 
            value={state.meta.coach || ''} 
            onChange={(e) => setMeta('coach', e.target.value)} 
            placeholder="Nombre del Coach" 
            disabled={esReadonly}
          />
        </div>
        <div>
          <label htmlFor="date_completed">Fecha</label>
          <input 
            id="date_completed" 
            type="date" 
            value={state.meta.fecha || ''} 
            onChange={(e) => setMeta('fecha', e.target.value)} 
            disabled={esReadonly}
          />
        </div>
      </div>
    </section>
  );
}
