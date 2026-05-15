import React, { useEffect, useState } from 'react';
import { useForm, DOMAIN_NAMES, slug } from '../context/FormContext';
import { useAuth } from '../context/AuthContext';
import ProgressBarSticky from '../components/form/ProgressBarSticky';
import SectionCard from '../components/form/SectionCard';
import DomainCard from '../components/form/DomainCard';
import ChildBlock from '../components/form/ChildBlock';
import PriorityList from '../components/form/PriorityList';
import TextArea from '../components/ui/TextArea';
import ScaleInput from '../components/ui/ScaleInput';
import './FormularioPage.css';

export default function FormularioPage() {
  const { state, setMeta, setRespuesta, loadProgress, estado, finalizadoAt, esReadonly, finalizando, finalizarFormulario, progreso, submitData, collectData } = useForm();
  const [mostrarConfirmacionFinalizar, setMostrarConfirmacionFinalizar] = useState(false);
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user?.email) {
      loadProgress(user.email);
    }
  }, [user, loadProgress]);

  const handleChange = (name, value) => {
    setRespuesta(name, value);
  };

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
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button 
              className="btn-view" 
              style={{ fontSize: '0.75rem', padding: '6px 14px' }}
              onClick={() => {
                const data = collectData();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'yo-real-actual-respuestas.json';
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

        {/* ── Datos iniciales ── */}
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

        {/* ── SECCIÓN 1: PULSO ACTUAL ── */}
        <SectionCard 
          number="1" 
          title="Pulso Actual" 
          subtitle="¿Cómo te sentís hoy con tu vida en general?"
          defaultOpen={true}
        >
          <div className="question">
            <div className="question-header">
              <div className="question-title">Satisfacción General</div>
              <span className="tag">Escala 1-10</span>
            </div>
            <ScaleInput 
              name="satisfaccion_general_score" 
              value={state.respuestas.satisfaccion_general_score || ''} 
              onChange={handleChange} 
              disabled={esReadonly}
            />
          </div>
          <TextArea 
            name="pulso_datos" 
            label="¿Qué datos (hechos) justifican ese número?" 
            value={state.respuestas.pulso_datos} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
          <TextArea 
            name="pulso_estado" 
            label="¿Cómo describirías tu estado predominante hoy?" 
            value={state.respuestas.pulso_estado} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
          <TextArea 
            name="pulso_felicidad" 
            label="¿Qué cosas te están dando felicidad hoy?" 
            value={state.respuestas.pulso_felicidad} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
          <TextArea 
            name="pulso_atencion" 
            label="¿Qué cosas te están robando energía o atención?" 
            value={state.respuestas.pulso_atencion} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
        </SectionCard>

        {/* ── SECCIÓN 2: LOS 5 DOMINIOS ── */}
        <SectionCard 
          number="2" 
          title="Los 5 Dominios de Vida" 
          subtitle="Mapeo detallado de las áreas fundamentales."
        >
          {DOMAIN_NAMES.map(domain => (
            <DomainCard 
              key={domain}
              domain={domain}
              slug={slug(domain)}
              values={state.respuestas}
              onChange={handleChange}
            />
          ))}
        </SectionCard>

        {/* ── SECCIÓN 3: VÍNCULOS E HIJOS ── */}
        <SectionCard 
          number="3" 
          title="Vínculos y Maternidad/Paternidad" 
          subtitle="La profundidad de tus relaciones primarias."
        >
          <ChildBlock index={1} values={state.respuestas} onChange={handleChange} />
          <ChildBlock index={2} values={state.respuestas} onChange={handleChange} />
        </SectionCard>

        {/* ── SECCIÓN 4: BIENESTAR INTERIOR ── */}
        <SectionCard 
          number="4" 
          title="Bienestar Interior y Mentalidad" 
          subtitle="Observando el mundo interno: pensamientos y emociones."
        >
          <div className="question">
            <div className="question-header">
              <div className="question-title">Nivel de Bienestar Interior</div>
              <span className="tag">Escala 1-10</span>
            </div>
            <ScaleInput 
              name="bienestar_interior_score" 
              value={state.respuestas.bienestar_interior_score || ''} 
              onChange={handleChange} 
              disabled={esReadonly}
            />
          </div>
          <TextArea 
            name="emociones_conciencia" 
            label="¿Qué tan consciente sos de tus emociones diarias?" 
            value={state.respuestas.emociones_conciencia} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
          <TextArea 
            name="dialogo_interno" 
            label="¿Cómo es tu diálogo interno hoy? ¿Qué te decís?" 
            value={state.respuestas.dialogo_interno} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
          <TextArea 
            name="mente_creativa" 
            label="¿En qué medida sentís que tu mente es creativa vs reactiva?" 
            value={state.respuestas.mente_creativa} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
          <div className="meta-grid">
            <TextArea name="miedos" label="Principales miedos" value={state.respuestas.miedos} onChange={handleChange} disabled={esReadonly} />
            <TextArea name="apegos" label="Principales apegos" value={state.respuestas.apegos} onChange={handleChange} disabled={esReadonly} />
          </div>
          <TextArea 
            name="limita" 
            label="¿Qué creencia sentís que te limita hoy?" 
            value={state.respuestas.limita} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
          <TextArea 
            name="centro" 
            label="¿Qué te devuelve a tu centro cuando lo perdés?" 
            value={state.respuestas.centro} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
          <TextArea 
            name="criticas" 
            label="¿Cómo manejás la crítica (propia y ajena)?" 
            value={state.respuestas.criticas} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
        </SectionCard>

        {/* ── SECCIÓN 5: LÍMITES Y AUTOCOMPASIÓN ── */}
        <SectionCard 
          number="5" 
          title="Límites y Relación con Uno Mismo" 
          subtitle="Capacidad de decir NO y de cuidarse."
        >
          <div className="question">
            <div className="question-header">
              <div className="question-title">Capacidad de poner límites</div>
              <span className="tag">Escala 1-10</span>
            </div>
            <ScaleInput 
              name="limites_personales_score" 
              value={state.respuestas.limites_personales_score || ''} 
              onChange={handleChange} 
              disabled={esReadonly}
            />
          </div>
          <TextArea 
            name="limites_donde" 
            label="¿En qué área te cuesta más poner límites?" 
            value={state.respuestas.limites_donde} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
          <TextArea 
            name="limites_costo" 
            label="¿Cuál es el costo de no poner esos límites?" 
            value={state.respuestas.limites_costo} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
          <div className="question">
            <div className="question-header">
              <div className="question-title">Nivel de Autocompasión</div>
              <span className="tag">Escala 1-10</span>
            </div>
            <ScaleInput 
              name="autocompasion_score" 
              value={state.respuestas.autocompasion_score || ''} 
              onChange={handleChange} 
              disabled={esReadonly}
            />
          </div>
          <TextArea 
            name="amor_propio" 
            label="¿Cómo practicás el amor propio concretamente?" 
            value={state.respuestas.amor_propio} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
          <div className="meta-grid">
            <TextArea name="perdon_propio" label="¿Qué necesitás perdonarte?" value={state.respuestas.perdon_propio} onChange={handleChange} disabled={esReadonly} />
            <TextArea name="perdon_otros" label="¿A quién necesitás perdonar?" value={state.respuestas.perdon_otros} onChange={handleChange} disabled={esReadonly} />
          </div>
          <TextArea 
            name="expresion_sentimientos" 
            label="¿Qué tan fácil te resulta expresar lo que sentís?" 
            value={state.respuestas.expresion_sentimientos} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
        </SectionCard>

        {/* ── SECCIÓN 6: PATRONES Y DECISIONES ── */}
        <SectionCard 
          number="6" 
          title="Patrones, Decisiones y Automatismos" 
          subtitle="Identificando lo que se repite y lo que está pendiente."
        >
          <TextArea 
            name="patrones_repetidos" 
            label="¿Qué situación o conflicto sentís que se repite en tu vida?" 
            value={state.respuestas.patrones_repetidos} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
          <TextArea 
            name="automaticos" 
            label="¿Cuáles son tus principales 'automáticos' (reacciones inconscientes)?" 
            value={state.respuestas.automaticos} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
          <TextArea 
            name="conversacion_pendiente" 
            label="¿Qué conversación tenés pendiente y con quién?" 
            value={state.respuestas.conversacion_pendiente} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
          <TextArea 
            name="decision_pendiente" 
            label="¿Qué decisión sabés que tenés que tomar pero venís postergando?" 
            value={state.respuestas.decision_pendiente} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
          <TextArea 
            name="beneficio_oculto" 
            label="¿Cuál es el 'beneficio oculto' de no tomar esa decisión?" 
            value={state.respuestas.beneficio_oculto} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
          <TextArea 
            name="versiones" 
            label="¿Qué versión de vos mismo/a sentís que ya caducó?" 
            value={state.respuestas.versiones} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
        </SectionCard>

        {/* ── SECCIÓN 7: SÍNTESIS Y COMPROMISO ── */}
        <SectionCard 
          number="7" 
          title="Síntesis y Compromiso con el Cambio" 
          subtitle="Cerrando el diagnóstico y abriendo la brecha."
        >
          <TextArea 
            name="descubrimiento" 
            label="¿Cuál fue tu mayor descubrimiento al completar este mapa?" 
            value={state.respuestas.descubrimiento} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
          <TextArea 
            name="brecha" 
            label="¿Cómo describirías hoy la brecha entre tu Yo Real y tu Yo Ideal?" 
            value={state.respuestas.brecha} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
          <div className="question">
            <div className="question-header">
              <div className="question-title">¿En qué áreas sentís que necesitás trabajar con más urgencia?</div>
              <span className="tag">Multiselección</span>
            </div>
            <PriorityList 
              selected={state.respuestas.prioridades || []} 
              onChange={handleChange} 
              disabled={esReadonly}
            />
          </div>
          <TextArea 
            name="tres_temas" 
            label="Si tuvieras que elegir SOLO 3 temas para tu proceso de coaching, ¿cuáles serían?" 
            value={state.respuestas.tres_temas} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
          <TextArea 
            name="compromiso" 
            label="Nivel de compromiso: ¿Qué estás dispuesto/a a soltar para que lo nuevo aparezca?" 
            value={state.respuestas.compromiso} 
            onChange={handleChange} 
            disabled={esReadonly}
          />
        </SectionCard>
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
            {finalizando ? 'Finalizando…' : 'Finalizar y enviar respuestas'}
          </button>
          {progreso < 100 && (
            <p className="finalizar-hint">
              Completá el 100% del formulario para poder finalizarlo. Estás al {progreso}%.
            </p>
          )}
        </div>
      )}
      
      <footer className="footer-note">
        <p>Todo lo expresado aquí es confidencial y forma parte de tu proceso personal de transformación.</p>
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
}
