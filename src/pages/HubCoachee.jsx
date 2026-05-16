import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAsignaciones } from '../hooks/useAsignaciones';
import FormularioCard from '../components/hub/FormularioCard';
import './HubCoachee.css';

export default function HubCoachee() {
  const { user, signOut } = useAuth();
  const { asignaciones, loading, error } = useAsignaciones();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Cálculo del contador de progreso global
  const totalAsignaciones = asignaciones.length;
  const completadas = asignaciones.filter(a => a.estado === 'finalizado').length;

  if (loading) {
    return (
      <div className="hub-loading">
        <p>Cargando tus formularios…</p>
      </div>
    );
  }

  // Caso de excepción: coachee sin asignaciones (no debería pasar pero por las dudas)
  if (!loading && asignaciones.length === 0) {
    return (
      <div className="hub-empty">
        <header className="hub-header">
          <div>
            <h1>Hola</h1>
            <p className="hub-subtitle">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </header>
        <main className="hub-empty-content">
          <div className="empty-state">
            <h2>Aún no tienes formularios asignados</h2>
            <p>Tu coach te va a habilitar el proceso muy pronto. Si tenés dudas, escribí a <a href="mailto:contacto@conscienciahumana.com">contacto@conscienciahumana.com</a>.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="hub-coachee">
      <header className="hub-header">
        <div className="hub-header__left">
          <h1>Tu Proceso</h1>
          <p className="hub-subtitle">{user?.email}</p>
        </div>
        <div className="hub-header__right">
          {totalAsignaciones > 0 && (
            <div className="hub-progress">
              <span className="hub-progress__label">
                {completadas} de {totalAsignaciones} formularios completados
              </span>
              <div className="hub-progress__track">
                <div 
                  className="hub-progress__fill"
                  style={{ width: `${(completadas / totalAsignaciones) * 100}%` }}
                />
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="hub-main">
        <div className="hub-cards-grid">
          {asignaciones.map(asignacion => (
            <FormularioCard 
              key={asignacion.id}
              asignacion={asignacion}
              onAbrir={() => navigate(`/formulario/${asignacion.formulario.codigo}`)}
            />
          ))}
        </div>
      </main>

      <footer className="hub-footer">
        <p>CONSCIENCIA · Coaching de Transformación</p>
      </footer>
    </div>
  );
}
