import { useForm, DOMAIN_NAMES, slug } from '../context/FormContext';
import useSummary from '../hooks/useSummary';
import Header from '../components/layout/Header';
import StickyActions from '../components/layout/StickyActions';
import SectionCard from '../components/form/SectionCard';
import DomainCard from '../components/form/DomainCard';
import ChildBlock from '../components/form/ChildBlock';
import PriorityList from '../components/form/PriorityList';
import ScaleInput from '../components/ui/ScaleInput';
import TextArea from '../components/ui/TextArea';
import './FormularioPage.css';

export default function FormularioPage() {
  const { state, setMeta, handleChange } = useForm();
  const { average, lowDomains, highDomains } = useSummary();
  const { respuestas } = state;

  return (
    <>
      <Header />

      <main className="container main-content">
        {/* ── Sentido de la etapa ── */}
        <section className="card panel">
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

        {/* ── Datos iniciales ── */}
        <section className="card panel">
          <h2>Datos iniciales</h2>
          <div className="meta-grid meta-grid-5">
            <div>
              <label htmlFor="coachee_nombre">Nombre</label>
              <input id="coachee_nombre" type="text" value={state.meta.coachee_nombre} onChange={(e) => setMeta('coachee_nombre', e.target.value)} placeholder="Nombre" />
            </div>
            <div>
              <label htmlFor="coachee_apellido">Apellido</label>
              <input id="coachee_apellido" type="text" value={state.meta.coachee_apellido} onChange={(e) => setMeta('coachee_apellido', e.target.value)} placeholder="Apellido" />
            </div>
            <div className="email-field">
              <label htmlFor="email">Email (para recuperar progreso)</label>
              <div className="email-field-wrapper">
                <input 
                  id="email" 
                  type="email" 
                  value={state.meta.email} 
                  onChange={(e) => setMeta('email', e.target.value)} 
                  placeholder="tu@email.com" 
                />
                <button 
                  type="button" 
                  className="btn-sync" 
                  onClick={async () => {
                    const found = await state.loadProgress(state.meta.email);
                    if (found) alert('¡Progreso recuperado con éxito!');
                    else alert('No se encontró progreso para este email.');
                  }}
                  title="Recuperar progreso guardado"
                >
                  🔄
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="coach_name">Coach</label>
              <input id="coach_name" type="text" value={state.meta.coach} onChange={(e) => setMeta('coach', e.target.value)} />
            </div>
            <div>
              <label htmlFor="date_completed">Fecha</label>
              <input id="date_completed" type="date" value={state.meta.fecha} onChange={(e) => setMeta('fecha', e.target.value)} />
            </div>
          </div>
        </section>

        {/* ── Barra sticky ── */}
        <StickyActions />

        {/* ── Lectura rápida ── */}
        <section className="card panel">
          <h2>Lectura rápida para el coach</h2>
          <div className="summary-grid">
            <div className="summary-box amber">
              <small>Promedio de escalas respondidas</small>
              <strong>{average ?? '—'}</strong>
              <p className="helper-text">No es diagnóstico clínico. Es una brújula inicial.</p>
            </div>
            <div className="summary-box rose">
              <small>Dominios que piden atención</small>
              {lowDomains.length > 0 ? (
                <ul>{lowDomains.map((d) => <li key={d.domain}>{d.domain}: {d.value}/10</li>)}</ul>
              ) : (
                <ul><li>Completar escalas para calcular.</li></ul>
              )}
            </div>
            <div className="summary-box green">
              <small>Dominios con mayor sostén</small>
              {highDomains.length > 0 ? (
                <ul>{highDomains.map((d) => <li key={d.domain}>{d.domain}: {d.value}/10</li>)}</ul>
              ) : (
                <ul><li>Completar escalas para calcular.</li></ul>
              )}
            </div>
          </div>
        </section>

        {/* ── Mapa del formulario ── */}
        <section className="card panel">
          <h2>Mapa del formulario</h2>
          <div className="nav-grid">
            <a href="#pulso">1. Pulso inicial</a>
            <a href="#dominios">2. Dominios de vida</a>
            <a href="#bienestar">3. Bienestar interior</a>
            <a href="#limites">4. Límites y perdón</a>
            <a href="#patrones">5. Patrones actuales</a>
            <a href="#brecha">6. Puente al Yo Ideal</a>
          </div>
        </section>

        {/* ═══ SECCIONES DEL FORMULARIO ═══ */}
        <form id="formulario" onSubmit={(e) => e.preventDefault()}>

          {/* ── 1. Pulso inicial ── */}
          <div id="pulso">
            <SectionCard number={1} title="Pulso inicial del Yo Real-Actual" subtitle="Primera foto de satisfacción, energía y estado interior." defaultOpen>
              <div className="question">
                <div className="question-header">
                  <div className="question-title">Hoy, en una escala del 1 al 10, ¿qué nivel de satisfacción general sentís con tu vida?</div>
                  <span className="tag">Escala</span>
                </div>
                <ScaleInput name="satisfaccion_general_score" domain="Satisfacción general" value={respuestas.satisfaccion_general_score || ''} onChange={handleChange} />
              </div>
              <TextArea name="pulso_datos" label="¿Qué datos concretos de tu vida actual explican ese número?" value={respuestas.pulso_datos} onChange={handleChange} />
              <TextArea name="pulso_estado" label="¿Cómo te sentís la mayor parte del tiempo?" value={respuestas.pulso_estado} onChange={handleChange} />
              <TextArea name="pulso_felicidad" label="¿Qué te hace feliz hoy, aunque sea simple o cotidiano?" value={respuestas.pulso_felicidad} onChange={handleChange} />
              <TextArea name="pulso_atencion" label="¿Qué sentís que está pidiendo atención ahora mismo?" value={respuestas.pulso_atencion} onChange={handleChange} />
            </SectionCard>
          </div>

          {/* ── 2. Dominios de vida ── */}
          <div id="dominios">
            <SectionCard number={2} title="Dominios de vida" subtitle="Radiografía concreta de las áreas principales de la vida." defaultOpen>
              <div className="domain-grid">
                {DOMAIN_NAMES.map((domain) => (
                  <DomainCard key={domain} domain={domain} slug={slug(domain)} values={respuestas} onChange={handleChange} />
                ))}
              </div>
              <ChildBlock index={1} values={respuestas} onChange={handleChange} />
              <ChildBlock index={2} values={respuestas} onChange={handleChange} />
            </SectionCard>
          </div>

          {/* ── 3. Bienestar interior ── */}
          <div id="bienestar">
            <SectionCard number={3} title="Bienestar interior" subtitle="Conciencia emocional, diálogo mental, centro interno y compasión." defaultOpen>
              <div className="question">
                <div className="question-header">
                  <div className="question-title">En una escala del 1 al 10, ¿cuánto tiempo y atención real dedicás a tu bienestar interior?</div>
                  <span className="tag">Escala</span>
                </div>
                <ScaleInput name="bienestar_interior_score" domain="Bienestar interior" value={respuestas.bienestar_interior_score || ''} onChange={handleChange} />
              </div>
              <TextArea name="emociones_conciencia" label="¿Sos consciente de tus emociones? ¿Cómo te das cuenta de lo que estás sintiendo?" value={respuestas.emociones_conciencia} onChange={handleChange} />
              <TextArea name="dialogo_interno" label="¿Sos consciente del diálogo que generan tus pensamientos? Describí cómo te hablás internamente." value={respuestas.dialogo_interno} onChange={handleChange} />
              <TextArea name="mente_creativa" label="¿Qué suele crear tu mente: posibilidades, amenazas, exigencias, calma, conflictos?" value={respuestas.mente_creativa} onChange={handleChange} />
              <TextArea name="miedos" label="¿Cuáles son tus cinco principales miedos actuales?" value={respuestas.miedos} onChange={handleChange} />
              <TextArea name="apegos" label="¿A qué estás apegado hoy?" value={respuestas.apegos} onChange={handleChange} />
              <TextArea name="limita" label="¿Qué sentís que te limita en tu vida actual?" value={respuestas.limita} onChange={handleChange} />
              <TextArea name="centro" label="¿Qué cosas te sacan de tu centro?" value={respuestas.centro} onChange={handleChange} />
              <TextArea name="criticas" label="¿Cómo reaccionás frente a las críticas?" value={respuestas.criticas} onChange={handleChange} />
            </SectionCard>
          </div>

          {/* ── 4. Límites, perdón y expresión ── */}
          <div id="limites">
            <SectionCard number={4} title="Límites, perdón y expresión emocional" subtitle="Cómo el Yo Real-Actual se cuida, se expresa y se vincula con el error.">
              <div className="question">
                <div className="question-header">
                  <div className="question-title">En una escala del 1 al 10, ¿qué tan fácil te resulta poner límites?</div>
                  <span className="tag">Escala</span>
                </div>
                <ScaleInput name="limites_personales_score" domain="Límites personales" value={respuestas.limites_personales_score || ''} onChange={handleChange} />
              </div>
              <TextArea name="limites_donde" label="¿Dónde te cuesta poner límites hoy?" value={respuestas.limites_donde} onChange={handleChange} />
              <TextArea name="limites_costo" label="¿Qué costo estás pagando por no poner esos límites?" value={respuestas.limites_costo} onChange={handleChange} />
              <div className="question">
                <div className="question-header">
                  <div className="question-title">En una escala del 1 al 10, ¿qué tan compasivo sos con vos mismo?</div>
                  <span className="tag">Escala</span>
                </div>
                <ScaleInput name="autocompasion_score" domain="Autocompasión" value={respuestas.autocompasion_score || ''} onChange={handleChange} />
              </div>
              <TextArea name="amor_propio" label="¿Te amás a vos mismo? Respondé desde conductas concretas." value={respuestas.amor_propio} onChange={handleChange} />
              <TextArea name="perdon_propio" label="¿Te perdonás a vos mismo? ¿Qué te cuesta perdonarte?" value={respuestas.perdon_propio} onChange={handleChange} />
              <TextArea name="perdon_otros" label="¿Te resulta fácil perdonar a los demás?" value={respuestas.perdon_otros} onChange={handleChange} />
              <TextArea name="expresion_sentimientos" label="¿Te permitís expresar tus sentimientos? ¿Cuáles sí y cuáles no?" value={respuestas.expresion_sentimientos} onChange={handleChange} />
            </SectionCard>
          </div>

          {/* ── 5. Patrones ── */}
          <div id="patrones">
            <SectionCard number={5} title="Patrones actuales y automatismos" subtitle="Lo que se repite, lo que se evita y lo que dirige desde abajo.">
              <TextArea name="patrones_repetidos" label="¿Qué comportamientos tuyos se repiten aunque después no te gusten sus consecuencias?" value={respuestas.patrones_repetidos} onChange={handleChange} />
              <TextArea name="automaticos" label="¿En qué situaciones reaccionás en automático en lugar de elegir conscientemente?" value={respuestas.automaticos} onChange={handleChange} />
              <TextArea name="conversacion_pendiente" label="¿Qué conversación venís postergando?" value={respuestas.conversacion_pendiente} onChange={handleChange} />
              <TextArea name="decision_pendiente" label="¿Qué decisión sabés que en algún momento vas a tener que tomar?" value={respuestas.decision_pendiente} onChange={handleChange} />
              <TextArea name="beneficio_oculto" label="¿Qué beneficio oculto puede tener para vos seguir igual?" value={respuestas.beneficio_oculto} onChange={handleChange} />
              <TextArea name="versiones" label="¿Qué versión de vos aparece frente a los demás y qué versión queda escondida?" value={respuestas.versiones} onChange={handleChange} />
            </SectionCard>
          </div>

          {/* ── 6. Puente al Yo Ideal ── */}
          <div id="brecha">
            <SectionCard number={6} title="Puente hacia el Yo Ideal" subtitle="No define todavía el ideal completo: identifica la brecha que empieza a aparecer." defaultOpen>
              <TextArea name="descubrimiento" label="Después de responder este formulario, ¿qué descubrimiento aparece con más fuerza sobre tu Yo Real-Actual?" value={respuestas.descubrimiento} onChange={handleChange} />
              <TextArea name="brecha" label="¿Qué distancia empezás a ver entre quien estás siendo hoy y quien te gustaría llegar a ser?" value={respuestas.brecha} onChange={handleChange} />
              <div className="textarea-field">
                <label>¿Qué áreas piden atención prioritaria?</label>
                <PriorityList selected={respuestas.prioridades || []} onChange={handleChange} />
              </div>
              <TextArea name="tres_temas" label="¿Qué tres temas querés trabajar con mayor profundidad durante el proceso?" value={respuestas.tres_temas} onChange={handleChange} />
              <TextArea name="compromiso" label="¿Qué compromiso inicial asumís para observarte sin justificarte ni escaparte hacia el ideal?" value={respuestas.compromiso} onChange={handleChange} />
            </SectionCard>
          </div>

        </form>

        <p className="footer-note">
          Sugerencia: responder en más de una sentada. La profundidad aparece cuando la persona deja de contestar para cumplir y empieza a observarse de verdad.
        </p>
      </main>
    </>
  );
}
