import { createContext, useContext, useReducer, useCallback, useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

// ── Helpers ──
export const DOMAIN_NAMES = [
  'Vínculos y Relaciones',
  'Salud y Vitalidad',
  'Propósito y Carrera',
  'Finanzas y Abundancia',
  'Entorno y Estilo de Vida'
];

export function slug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .replace(/^_|_$/g, '');
}

const FormContext = createContext(null);

export const FormProvider = ({ children }) => {
  const { user } = useAuth();
  
  const initialState = {
    meta: {
      coachee_nombre: '',
      coachee_apellido: '',
      email: user?.email || '',
      coach: '',
      fecha: new Date().toISOString().slice(0, 10),
      etapa: 'Yo Real-Actual'
    },
    respuestas: {},
    submitting: false,
    submitted: false
  };

  const [state, dispatch] = useReducer(formReducer, initialState);

  const [estado, setEstado] = useState('en_progreso'); // 'en_progreso' | 'finalizado'
  const [finalizadoAt, setFinalizadoAt] = useState(null);
  const [finalizando, setFinalizando] = useState(false);

  const esReadonly = estado === 'finalizado';

  const fieldNames = useMemo(() => {
    const names = [];
    names.push('satisfaccion_general_score', 'pulso_datos', 'pulso_estado', 'pulso_felicidad', 'pulso_atencion');
    DOMAIN_NAMES.forEach((d) => {
      const s = slug(d);
      names.push(`${s}_score`, `${s}_estado`, `${s}_patron`, `${s}_necesita`);
    });
    [1, 2].forEach((i) => {
      names.push(`hijo_${i}_nombre`, `hijo_${i}_score`, `hijo_${i}_necesita`, `hijo_${i}_patron`, `hijo_${i}_gesto`);
    });
    names.push('bienestar_interior_score', 'emociones_conciencia', 'dialogo_interno', 'mente_creativa', 'miedos', 'apegos', 'limita', 'centro', 'criticas');
    names.push('limites_personales_score', 'limites_donde', 'limites_costo', 'autocompasion_score', 'amor_propio', 'perdon_propio', 'perdon_otros', 'expresion_sentimientos');
    names.push('patrones_repetidos', 'automaticos', 'conversacion_pendiente', 'decision_pendiente', 'beneficio_oculto', 'versiones');
    names.push('descubrimiento', 'brecha', 'prioridades', 'tres_temas', 'compromiso');
    return names;
  }, []);

  const progreso = useMemo(() => {
    let count = 0;
    fieldNames.forEach((name) => {
      const val = state.respuestas[name];
      if (val === undefined || val === null || val === '') return;
      if (Array.isArray(val) && val.length === 0) return;
      count++;
    });
    return fieldNames.length ? Math.round((count / fieldNames.length) * 100) : 0;
  }, [state.respuestas, fieldNames]);

  // Actualizar email si cambia el usuario
  useEffect(() => {
    if (user?.email) {
      dispatch({ type: 'SET_META', payload: { key: 'email', value: user.email } });
    }
  }, [user]);

  const setMeta = (key, value) => dispatch({ type: 'SET_META', payload: { key, value } });
  const setRespuesta = (key, value) => dispatch({ type: 'SET_RESPUESTA', payload: { key, value } });
  const setAll = (data) => dispatch({ type: 'SET_ALL', payload: data });
  const clear = () => dispatch({ type: 'CLEAR' });

  const collectData = useCallback(() => {
    return {
      user_id: user?.id,
      email: user?.email || state.meta.email,
      coachee_nombre: state.meta.coachee_nombre,
      coachee_apellido: state.meta.coachee_apellido,
      coach: state.meta.coach,
      fecha: state.meta.fecha,
      etapa: state.meta.etapa,
      respuestas: { ...state.respuestas }
    };
  }, [state, user]);

  const loadProgress = useCallback(async (email) => {
    if (!email) return;
    try {
      const { data, error } = await supabase
        .from('respuestas')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setAll({
          meta: {
            coachee_nombre: data.coachee_nombre,
            coachee_apellido: data.coachee_apellido,
            email: data.email,
            coach: data.coach,
            fecha: data.fecha,
            etapa: data.etapa
          },
          respuestas: data.respuestas || {}
        });
        setEstado(data.estado || 'en_progreso');
        setFinalizadoAt(data.finalizado_at || null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error cargando progreso:', err);
      return false;
    }
  }, []);

  const submitData = useCallback(async () => {
    dispatch({ type: 'SUBMIT_START' });
    try {
      const data = collectData();
      
      if (!data.user_id) {
        throw new Error('No hay una sesión de usuario activa. Por favor, volvé a ingresar.');
      }

      console.log('Intentando guardar datos para:', data.email, 'ID:', data.user_id);

      const { error, data: result } = await supabase
        .from('respuestas')
        .upsert(
          {
            user_id: data.user_id,
            email: data.email,
            coachee_nombre: data.coachee_nombre,
            coachee_apellido: data.coachee_apellido,
            coach: data.coach,
            fecha: data.fecha,
            etapa: data.etapa,
            respuestas: data.respuestas
          },
          { onConflict: 'email' }
        )
        .select();

      if (error) {
        console.error('Error detallado de Supabase:', error);
        throw error;
      }
      
      console.log('Guardado exitoso:', result);
      
      // ── Disparar notificación por mail (Edge Function + Resend) ──
      try {
        console.log('[MAIL] Intentando enviar notificación...');
        const { error: funcError } = await supabase.functions.invoke('send-form-notification', {
          body: {
            coachee_nombre: data.coachee_nombre,
            coachee_apellido: data.coachee_apellido,
            email: data.email,
            coach: data.coach
          }
        });
        
        if (funcError) {
          console.error('[MAIL] Error de la función:', funcError);
        } else {
          console.log('[MAIL] Notificación enviada correctamente');
        }
      } catch (mailErr) {
        // No bloqueamos el flujo principal si falla el mail
        console.error('[MAIL] Fallo al disparar notificación:', mailErr);
      }

      dispatch({ type: 'SUBMIT_END', success: true });
      return { success: true };
    } catch (error) {
      console.error('Error en submitData:', error);
      dispatch({ type: 'SUBMIT_END', success: false });
      return { 
        success: false, 
        error: error.message || 'Error desconocido al guardar' 
      };
    }
  }, [collectData]);

  const finalizarFormulario = async () => {
    if (progreso < 100) {
      console.warn('[FORM] Intento de finalizar con progreso < 100%');
      return { error: { message: 'El formulario debe estar al 100% para finalizarse' } };
    }
    
    setFinalizando(true);
    console.log('[FORM] Finalizando formulario');
    
    try {
      // Primero guardar el estado actual de respuestas
      const { success, error: errorGuardado } = await submitData();
      if (!success) {
        setFinalizando(false);
        return { error: { message: errorGuardado } };
      }
      
      // Después marcar como finalizado
      const { error: errorFinalizado } = await supabase
        .from('respuestas')
        .update({
          estado: 'finalizado',
          finalizado_at: new Date().toISOString(),
          finalizado_por: user.id,
        })
        .eq('user_id', user.id);
      
      if (errorFinalizado) {
        console.error('[FORM] Error finalizando:', errorFinalizado);
        setFinalizando(false);
        return { error: errorFinalizado };
      }
      
      setEstado('finalizado');
      setFinalizadoAt(new Date().toISOString());
      setFinalizando(false);
      console.log('[FORM] Formulario finalizado correctamente');
      return { error: null };
    } catch (err) {
      console.error('[FORM] Excepción finalizando:', err);
      setFinalizando(false);
      return { error: err };
    }
  };

  const value = {
    state,
    dispatch,
    setMeta,
    setRespuesta,
    setAll,
    clear,
    collectData,
    submitData,
    loadProgress,
    estado,
    finalizadoAt,
    esReadonly,
    finalizando,
    finalizarFormulario,
    progreso
  };

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_META':
      return { ...state, meta: { ...state.meta, [action.payload.key]: action.payload.value } };
    case 'SET_RESPUESTA':
      return { ...state, respuestas: { ...state.respuestas, [action.payload.key]: action.payload.value } };
    case 'SET_ALL':
      return { ...state, meta: { ...state.meta, ...action.payload.meta }, respuestas: action.payload.respuestas };
    case 'SUBMIT_START':
      return { ...state, submitting: true };
    case 'SUBMIT_END':
      return { ...state, submitting: false, submitted: action.success };
    case 'CLEAR':
      return { ...state, meta: { ...state.meta, coachee_nombre: '', coachee_apellido: '' }, respuestas: {} };
    default:
      return state;
  }
}

export const useForm = () => useContext(FormContext);
export const useFormContext = useForm;
