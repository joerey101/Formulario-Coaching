import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAsignaciones } from '../../hooks/useAsignaciones';

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      color: '#666'
    }}>
      Cargando…
    </div>
  );
}

export default function SmartRedirect() {
  const { asignaciones, loading } = useAsignaciones();

  useEffect(() => {
    if (!loading) {
      console.log('[HUB] SmartRedirect: asignaciones cargadas, decidiendo destino');
    }
  }, [loading]);

  if (loading) return <LoadingScreen />;

  // Filtrar las asignaciones habilitadas con estado en_progreso
  const enProgreso = asignaciones.filter(
    a => a.habilitado && a.estado === 'en_progreso'
  );

  if (enProgreso.length === 1) {
    const destino = `/formulario/${enProgreso[0].formulario.codigo}`;
    console.log('[HUB] SmartRedirect: 1 formulario en progreso, redirigiendo a', destino);
    return <Navigate to={destino} replace />;
  }

  // Si tiene 0 o más de 1 en progreso, va al hub
  console.log('[HUB] SmartRedirect: redirigiendo al hub (en_progreso count:', enProgreso.length, ')');
  return <Navigate to="/hub" replace />;
}
