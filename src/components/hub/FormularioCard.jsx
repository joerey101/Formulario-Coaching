import './FormularioCard.css';

export default function FormularioCard({ asignacion, onAbrir }) {
  const { formulario, estado, habilitado, finalizado_at, solicitud_reapertura_pendiente } = asignacion;

  // Lógica del estado visual y botón
  let estadoLabel = '';
  let estadoIcon = '';
  let estadoClass = '';
  let botonLabel = '';
  let botonDisabled = false;

  if (!habilitado) {
    estadoLabel = 'Bloqueado';
    estadoIcon = '🔒';
    estadoClass = 'card-estado--bloqueado';
    botonLabel = 'No disponible aún';
    botonDisabled = true;
  } else if (estado === 'finalizado') {
    estadoLabel = 'Finalizado';
    estadoIcon = '✅';
    estadoClass = 'card-estado--finalizado';
    botonLabel = solicitud_reapertura_pendiente 
      ? 'Reapertura solicitada'
      : 'Ver respuestas';
    botonDisabled = solicitud_reapertura_pendiente;
  } else if (estado === 'en_progreso') {
    estadoLabel = 'En progreso';
    estadoIcon = '✏️';
    estadoClass = 'card-estado--en-progreso';
    botonLabel = 'Continuar';
  } else {
    estadoLabel = 'Disponible';
    estadoIcon = '▶️';
    estadoClass = 'card-estado--disponible';
    botonLabel = 'Empezar';
  }

  return (
    <article className={`formulario-card ${!habilitado ? 'formulario-card--bloqueado' : ''}`}>
      <div className="formulario-card__header">
        <span className={`card-estado ${estadoClass}`}>
          {estadoIcon} {estadoLabel}
        </span>
        {formulario.es_sistema && (
          <span className="card-tag card-tag--sistema">CONSCIENCIA</span>
        )}
      </div>

      <div className="formulario-card__body">
        <h2 className="formulario-card__titulo">{formulario.titulo}</h2>
        {formulario.descripcion && (
          <p className="formulario-card__descripcion">{formulario.descripcion}</p>
        )}
        {estado === 'finalizado' && finalizado_at && (
          <p className="formulario-card__finalizado-info">
            Finalizado el {new Date(finalizado_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>

      <div className="formulario-card__footer">
        <button 
          className={`btn-card ${habilitado ? 'btn-card--activo' : 'btn-card--bloqueado'}`}
          onClick={onAbrir}
          disabled={botonDisabled}
        >
          {botonLabel}
        </button>
      </div>
    </article>
  );
}
