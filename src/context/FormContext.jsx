import { createContext, useContext, useReducer, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const FormContext = createContext(null);

// ── Dominios de vida ──
export const DOMAIN_NAMES = [
  'Trabajo / profesión', 'Dinero / seguridad', 'Salud / cuerpo',
  'Alimentación / cuidado', 'Pareja / familia', 'Amistades / red de apoyo',
  'Propósito / sentido', 'Espiritualidad / vida interior',
  'Tiempo / hábitos', 'Descanso / disfrute'
];

export function slug(text) {
  return text.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

// ── Estado inicial ──
const initialState = {
  meta: {
    coachee_nombre: '',
    coachee_apellido: '',
    email: '',
    coach: '',
    fecha: new Date().toISOString().slice(0, 10),
    etapa: 'Yo Real-Actual'
  },
  respuestas: {},
  submitting: false,
  submitted: false
};

// ── Reducer ──
function formReducer(state, action) {
  switch (action.type) {
    case 'SET_META':
      return { ...state, meta: { ...state.meta, [action.field]: action.value } };
    case 'SET_RESPUESTA':
      return { ...state, respuestas: { ...state.respuestas, [action.name]: action.value } };
    case 'SET_ALL':
      return { ...state, ...action.payload };
    case 'SUBMIT_START':
      return { ...state, submitting: true };
    case 'SUBMIT_END':
      return { ...state, submitting: false, submitted: action.success };
    case 'CLEAR':
      return { ...initialState, meta: { ...initialState.meta, fecha: new Date().toISOString().slice(0, 10) } };
    default:
      return state;
  }
}

// ── Provider ──
export function FormProvider({ children }) {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const setMeta = useCallback((field, value) => {
    dispatch({ type: 'SET_META', field, value });
  }, []);

  const setRespuesta = useCallback((name, value) => {
    dispatch({ type: 'SET_RESPUESTA', name, value });
  }, []);

  const handleChange = useCallback((name, value, _domain) => {
    dispatch({ type: 'SET_RESPUESTA', name, value });
  }, []);

  const setAll = useCallback((payload) => {
    dispatch({ type: 'SET_ALL', payload });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const collectData = useCallback(() => {
    return {
      coachee_nombre: state.meta.coachee_nombre,
      coachee_apellido: state.meta.coachee_apellido,
      email: state.meta.email,
      coach: state.meta.coach,
      fecha: state.meta.fecha,
      etapa: state.meta.etapa,
      respuestas: { ...state.respuestas }
    };
  }, [state]);

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
        dispatch({
          type: 'SET_ALL',
          payload: {
            meta: {
              coachee_nombre: data.coachee_nombre,
              coachee_apellido: data.coachee_apellido,
              email: data.email,
              coach: data.coach,
              fecha: data.fecha,
              etapa: data.etapa
            },
            respuestas: data.respuestas || {}
          }
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
      if (!data.email) throw new Error('El email es obligatorio para guardar el progreso.');
      
      const { error } = await supabase
        .from('respuestas')
        .upsert(
          {
            email: data.email.toLowerCase().trim(),
            coachee_nombre: data.coachee_nombre,
            coachee_apellido: data.coachee_apellido,
            coach: data.coach,
            fecha: data.fecha,
            etapa: data.etapa,
            respuestas: data.respuestas
          },
          { onConflict: 'email' }
        );

      if (error) throw error;
      
      dispatch({ type: 'SUBMIT_END', success: true });
      return { success: true };
    } catch (error) {
      console.error('Error Supabase:', error);
      dispatch({ type: 'SUBMIT_END', success: false });
      return { success: false, error: error.message || 'Error al conectar con la base de datos' };
    }
  }, [collectData]);

  const value = {
    state,
    dispatch,
    setMeta,
    setRespuesta,
    handleChange,
    setAll,
    clear,
    collectData,
    submitData,
    loadProgress
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
}

// ── Hook ──
export function useForm() {
  const context = useContext(FormContext);
  if (!context) throw new Error('useForm must be used within a FormProvider');
  return context;
}
