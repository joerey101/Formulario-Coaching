import { createContext, useContext, useReducer, useCallback } from 'react';

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
      coach: state.meta.coach,
      fecha: state.meta.fecha,
      etapa: state.meta.etapa,
      respuestas: { ...state.respuestas }
    };
  }, [state]);

  const submitData = useCallback(async () => {
    dispatch({ type: 'SUBMIT_START' });
    try {
      const data = collectData();
      const response = await fetch('/api/respuestas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      const success = response.ok;
      
      dispatch({ type: 'SUBMIT_END', success });
      
      if (!success) {
        return { success: false, error: result.error || 'Error desconocido del servidor' };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error de red:', error);
      dispatch({ type: 'SUBMIT_END', success: false });
      return { success: false, error: 'Error de red: No se pudo conectar con el servidor.' };
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
    submitData
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
