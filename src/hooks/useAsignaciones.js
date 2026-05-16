import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * Devuelve las asignaciones del coachee logueado, con join al formulario
 * y al coach autor para mostrar tags en la UI.
 */
export function useAsignaciones() {
  const { user } = useAuth();
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAsignaciones = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Query con joins: asignaciones + formularios + (opcionalmente) coach autor
      const { data, error: queryError } = await supabase
        .from('asignaciones')
        .select(`
          id,
          coachee_user_id,
          formulario_id,
          habilitado,
          estado,
          finalizado_at,
          solicitud_reapertura_pendiente,
          activado_at,
          formulario:formularios!inner (
            id,
            codigo,
            titulo,
            descripcion,
            es_sistema,
            orden_sugerido,
            autor_coach_id,
            activo
          )
        `)
        .eq('coachee_user_id', user.id)
        .eq('formulario.activo', true)
        .order('orden_sugerido', { foreignTable: 'formularios', ascending: true });

      if (queryError) {
        console.error('[HUB] Error cargando asignaciones:', queryError);
        setError(queryError);
        setAsignaciones([]);
      } else {
        console.log('[HUB] Asignaciones cargadas:', data?.length || 0);
        setAsignaciones(data || []);
      }
    } catch (err) {
      console.error('[HUB] Excepción cargando asignaciones:', err);
      setError(err);
      setAsignaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsignaciones();
  }, [user?.id]);

  return {
    asignaciones,
    loading,
    error,
    refetch: fetchAsignaciones,
  };
}
