import React, { useEffect, useState } from 'react';
import { FormProvider, useForm } from '../context/FormContext';
import { useAuth } from '../context/AuthContext';
import ProgressBarSticky from '../components/form/ProgressBarSticky';
import SectionCard from '../components/form/SectionCard';
import IntroduccionPanel from '../components/form/IntroduccionPanel';
import { useParams, useNavigate } from 'react-router-dom';
import { useAsignaciones } from '../hooks/useAsignaciones';
import './FormularioPage.css';

const FormularioContent = () => {
  const { state, config, progreso, estado, finalizadoAt, esReadonly, finalizando, finalizarFormulario, submitData, collectData } = useForm();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mostrarConfirmacionFinalizar, setMostrarConfirmacionFinalizar] = useState(false);

  const DatosInicialesComp = config.datosIniciales?.componente;

  return (
    <div className="container main-content">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1>{config.pageTitulo}</h1>
          <p className="subtitle">{config.subtitulo}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Sesión iniciada: <strong>{user?.email}</strong>
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => navigate('/hub')} 
              className="btn-view"
              style={{ fontSize: '0.75rem', padding: '6px 14px' }}
            >
              ← Volver al Hub
            </button>
            <button 
              className="btn-view" 
              style={{ fontSize: '0.75rem', padding: '6px 14px' }}
              onClick={() => {
                const data = collectData();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${config.codigo}-respuestas.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              }}
            >
              Exportar
            </button>
            <button 
              className="btn-view" 
              style={{ fontSize: '0.75rem', padding: '6px 14px' }}
              onClick={() => window.print()}
            >
              PDF / Imprimir
            </button>
            <button onClick={signOut} className="btn-view" style={{ fontSize: '0.75rem', padding: '6px 14px' }}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="formulario-main">
        {esReadonly && (
          <div className="readonly-banner">
            <div className="readonly-banner__icon">🔒</div>
            <div className="readonly-banner__text">
              <strong>Formulario finalizado</strong>
              <span>el {new Date(finalizadoAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}. Para modificar tus respuestas, contactá a tu coach.</span>
            </div>
          </div>
        )}

        {/* Renderiza Datos Iniciales si existe en la config */}
        {DatosInicialesComp && <DatosInicialesComp />}

        {/* Renderiza Introducción si existe en la config */}
        {config.introduccion && <IntroduccionPanel introduccion={config.introduccion} />}

        {/* Renderiza las secciones dinámicamente */}
        {config.secciones.map((s) => {
          const Componente = s.componente;
          return (
            <SectionCard 
              key={s.id} 
              number={s.id} 
              title={s.titulo} 
              subtitle={s.subtitulo}
              defaultOpen={s.defaultOpen}
            >
              <Componente />
            </SectionCard>
          );
        })}
      </main>

      <ProgressBarSticky 
        onGuardar={submitData}
        guardando={state.submitting}
        deshabilitado={esReadonly}
      />

      {!esReadonly && (
        <div className="form-finalizar-container">
          <button
            className={`btn-finalizar ${progreso === 100 ? 'btn-finalizar--activo' : ''}`}
            disabled={progreso < 100 || finalizando}
            onClick={() => setMostrarConfirmacionFinalizar(true)}
          >
            {finalizando ? 'Finalizando…' : config.textoBotonFinalizar}
          </button>
          {progreso < 100 && (
            <p className="finalizar-hint">
              Completá el 100% del formulario para poder finalizarlo. Estás al {progreso}%.
            </p>
          )}
        </div>
      )}
      
      <footer className="footer-note">
        <p>{config.footerNote}</p>
        <p className="footer-brand">CONSCIENCIA · Coaching de Transformación (v2.1)</p>
      </footer>

      {/* ── Modal de Confirmación ── */}
      {mostrarConfirmacionFinalizar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>¿Estás seguro de que querés finalizar?</h3>
            <p>Una vez finalizado, el formulario quedará en modo lectura y no podrás modificar tus respuestas a menos que tu coach lo reabra.</p>
            <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button 
                className="btn-view" 
                onClick={() => setMostrarConfirmacionFinalizar(false)}
                disabled={finalizando}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary" 
                onClick={async () => {
                  const result = await finalizarFormulario();
                  setMostrarConfirmacionFinalizar(false);
                  if (result.error) {
                    alert(`Error al finalizar: ${result.error.message}`);
                  }
                }}
                disabled={finalizando}
              >
                {finalizando ? 'Finalizando...' : 'Sí, finalizar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FormularioPage = () => {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const { asignaciones, loading: loadingAsignaciones } = useAsignaciones();

  // Verificar que el coachee tiene acceso a este formulario
  useEffect(() => {
    if (!loadingAsignaciones) {
      const asignacion = asignaciones.find(
        a => a.formulario.codigo === codigo && a.habilitado
      );
      if (!asignacion) {
        console.warn('[FORM] Coachee no tiene asignación habilitada para:', codigo);
        navigate('/hub', { replace: true });
      }
    }
  }, [codigo, asignaciones, loadingAsignaciones, navigate]);

  if (loadingAsignaciones) {
    return <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-muted)' }}>Cargando formulario...</div>;
  }

  const asignacion = asignaciones.find(
    a => a.formulario.codigo === codigo && a.habilitado
  );

  if (!asignacion) return null; // Evita parpadeos antes de la redirección

  return (
    <FormProvider codigo={codigo} asignacionId={asignacion.id}>
      <FormularioContent />
    </FormProvider>
  );
};

export default FormularioPage;
