import React, { useEffect } from 'react';
import { useForm } from '../context/FormContext';
import { useAuth } from '../context/AuthContext';
import StickyActions from '../components/layout/StickyActions';
import './FormularioPage.css';

export default function FormularioPage() {
  const { state, setMeta, setRespuesta, loadProgress } = useForm();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user?.email) {
      loadProgress(user.email);
    }
  }, [user, loadProgress]);

  return (
    <div className="container main-content">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1>Autoobservación</h1>
          <p className="subtitle">Explora tu "Yo Real" y diseña tu "Yo Ideal"</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Sesión iniciada: <strong>{user?.email}</strong>
          </p>
          <button onClick={signOut} className="btn-view" style={{ fontSize: '0.75rem', padding: '6px 14px' }}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="formulario-main">
        {/* ── Datos iniciales ── */}
        <section className="card panel">
          <h2>Datos iniciales</h2>
          <div className="meta-grid">
            <div>
              <label htmlFor="coachee_nombre">Nombre</label>
              <input id="coachee_nombre" type="text" value={state.meta.coachee_nombre} onChange={(e) => setMeta('coachee_nombre', e.target.value)} placeholder="Nombre" />
            </div>
            <div>
              <label htmlFor="coachee_apellido">Apellido</label>
              <input id="coachee_apellido" type="text" value={state.meta.coachee_apellido} onChange={(e) => setMeta('coachee_apellido', e.target.value)} placeholder="Apellido" />
            </div>
          </div>
          <div className="meta-grid" style={{ marginTop: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 0.5fr))' }}>
            <div>
              <label htmlFor="coach_name">Coach</label>
              <input id="coach_name" type="text" value={state.meta.coach} onChange={(e) => setMeta('coach', e.target.value)} placeholder="Nombre del Coach" />
            </div>
            <div>
              <label htmlFor="date_completed">Fecha</label>
              <input id="date_completed" type="date" value={state.meta.fecha} onChange={(e) => setMeta('fecha', e.target.value)} />
            </div>
          </div>
        </section>

        {/* ── Introducción ── */}
        <section className="card panel panel-intro">
          <h2>Sentido de esta etapa</h2>
          <p>
            Este formulario organiza la primera etapa del proceso: observar el{' '}
            <strong>Yo Real-Actual</strong>. La finalidad no es juzgar, sino reconocer con precisión
            conductas, patrones, emociones, vínculos, hábitos y decisiones pendientes.
          </p>
          <p>
            El <strong>Yo Ideal</strong> no se trabaja todavía como fantasía o aspiración genérica.
            Se construirá después, a partir de la brecha real que aparezca en este diagnóstico.
          </p>
          <div className="principles">
            <div className="principle"><strong>1. Ver</strong><span>Nombrar lo que hoy ocurre, sin adornarlo ni dramatizarlo.</span></div>
            <div className="principle"><strong>2. Reconocer patrones</strong><span>Identificar repeticiones, automatismos, límites y costos.</span></div>
            <div className="principle"><strong>3. Abrir dirección</strong><span>Detectar la distancia entre la realidad actual y la vida deseada.</span></div>
          </div>
        </section>

        {/* Aquí irían el resto de las secciones del formulario */}
        {/* ... */}
      </main>

      <StickyActions />
      
      <footer className="footer-note">
        <p>Todo lo expresado aquí es confidencial y forma parte de tu proceso personal de transformación.</p>
      </footer>
    </div>
  );
}
