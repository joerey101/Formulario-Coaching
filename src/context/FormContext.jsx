import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
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

  const value = {
    state,
    dispatch,
    setMeta,
    setRespuesta,
    setAll,
    clear,
    collectData,
    submitData,
    loadProgress
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
