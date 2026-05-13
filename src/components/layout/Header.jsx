import { useForm } from '../../context/FormContext';
import './Header.css';

export default function Header() {
  const { state, setMeta } = useForm();

  return (
    <header className="container header">
      <section className="hero">
        <div className="card hero-main">
          <div className="eyebrow">Etapa 1 · Yo Real-Actual</div>
          <h1>Mapa de Autoobservación 360°</h1>
          <p className="subtitle">
            Una herramienta para mirar quién está siendo hoy la persona, antes de diseñar quién quiere llegar a ser. Primero realidad. Después dirección.
          </p>
          <div className="pill-row">
            <span className="pill">Autoobservación</span>
            <span className="pill">Autocorrección</span>
            <span className="pill">Bienestar interior</span>
            <span className="pill">Puente al Yo Ideal</span>
          </div>
        </div>
        <aside className="card hero-side">
          <h2>Regla central</h2>
          <p>Responder desde hechos actuales, no desde deseos, justificaciones, culpa ni versión idealizada.</p>
          <p><strong>Pregunta guía:</strong><br />¿Esto describe cómo estoy viviendo hoy o cómo me gustaría vivir?</p>
        </aside>
      </section>
    </header>
  );
}
