import { createContext, useContext, useReducer, useCallback, useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { getFormularioConfig } from '../formularios/configs';

// ── Helpers (Se conservan aquí por pedido del usuario) ──
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

export const FormProvider = ({ children, codigo, asignacionId }) => {
  const { user } = useAuth();
  
  // Cargar la configuración del formulario según el código
  const config = useMemo(() => getFormularioConfig(codigo), [codigo]);
  
  // Obtener los fieldNames desde la config
  const fieldNames = useMemo(() => {
    return config.secciones.flatMap(s => s.fieldNames);
  }, [config]);

  const initialState = {
    meta: {
      coachee_nombre: '',
      coachee_apellido: '',
      email: user?.email || '',
      coach: '',
      fecha: new Date().toISOString().slice(0, 10),
      etapa: config.titulo // Usamos el título de la config
    },
    respuestas: {},
    submitting: false,
    submitted: false
  };

  const [state, dispatch] = useReducer(formReducer, initialState);

  const [estado, setEstado] = useState('en_progreso'); // 'en_progreso' | 'finalizado'
  const [finalizadoAt, setFinalizadoAt] = useState(null);
  const [finalizando, setFinalizando] = useState(false);
  const [formularioId, setFormularioId] = useState(null);

  const esReadonly = estado === 'finalizado';

  // Progreso calculado usando los fieldNames de la config
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

  // Cargar progreso inicial basado en asignacionId
  useEffect(() => {
    const cargarProgreso = async () => {
      if (!asignacionId || !codigo) return;
      
      console.log(`[FORM] Cargando progreso para asignación: ${asignacionId}`);
      try {
        // 1. Buscar el formulario_id por su codigo
        const { data: form, error: formError } = await supabase
          .from('formularios')
          .select('id')
          .eq('codigo', codigo)
          .single();

        if (formError || !form) {
          console.error(`[FORM] No se encontró formulario con codigo=${codigo}`);
          return;
        }
        setFormularioId(form.id);

        // 2. Cargar respuesta existente para esta asignación
        const { data, error } = await supabase
          .from('respuestas')
          .select('*')
          .eq('asignacion_id', asignacionId)
          .maybeSingle();

        if (error) throw error;
        
        if (data) {
          // Seleccionar la fuente de respuestas según el storage de la config
          const isJsonb = config.storage === 'jsonb';
          const respuestasData = isJsonb ? (data.respuestas_json || {}) : (data.respuestas || {});
          console.log(`[FORM] Respuestas encontradas (storage: ${isJsonb ? 'jsonb' : 'columns'}), cargando estado.`);
          setAll({
            meta: {
              coachee_nombre: data.coachee_nombre || '',
              coachee_apellido: data.coachee_apellido || '',
              email: data.email || user?.email || '',
              coach: data.coach || '',
              fecha: data.fecha || new Date().toISOString().slice(0, 10),
              etapa: data.etapa || config.titulo
            },
            respuestas: respuestasData
          });
          setEstado(data.estado || 'en_progreso');
          setFinalizadoAt(data.finalizado_at || null);
        } else {
          console.log('[FORM] No hay respuestas previas para esta asignación.');
        }
      } catch (err) {
        console.error('[FORM] Error cargando progreso:', err);
      }
    };

    cargarProgreso();
  }, [codigo, asignacionId, user, config.titulo]);

  // submitData adaptado para usar formulario_id y asignacion_id
  const submitData = useCallback(async () => {
    dispatch({ type: 'SUBMIT_START' });
    try {
      const data = collectData();
      
      if (!data.user_id) {
        throw new Error('No hay una sesión de usuario activa. Por favor, volvé a ingresar.');
      }

      const isJsonb = config.storage === 'jsonb';
      console.log(`[FORM] Intentando guardar datos (storage: ${isJsonb ? 'jsonb' : 'columns'}) para:`, data.email, 'Asignación:', asignacionId);

      const payload = {
        user_id: data.user_id,
        email: data.email,
        coachee_nombre: data.coachee_nombre,
        coachee_apellido: data.coachee_apellido,
        coach: data.coach,
        fecha: data.fecha,
        etapa: data.etapa,
        formulario_id: formularioId,
        asignacion_id: asignacionId,
        estado: estado,
        updated_at: new Date().toISOString()
      };

      // Guardar respuestas en la columna correspondiente según el storage
      if (isJsonb) {
        payload.respuestas_json = data.respuestas;
      } else {
        payload.respuestas = data.respuestas;
      }

      const { error, data: result } = await supabase
        .from('respuestas')
        .upsert(payload, { onConflict: 'asignacion_id' })
        .select();

      if (error) {
        console.error('[FORM] Error detallado de Supabase:', error);
        throw error;
      }
      
      console.log('[FORM] Guardado exitoso:', result);
      
      // ── Disparar notificación por mail (Edge Function + Resend) ──
      try {
        console.log('[FORM] Intentando enviar notificación...');
        const { error: funcError } = await supabase.functions.invoke('send-form-notification', {
          body: {
            coachee_nombre: data.coachee_nombre,
            coachee_apellido: data.coachee_apellido,
            email: data.email,
            coach: data.coach
          }
        });
        
        if (funcError) {
          console.error('[FORM] Error de la función:', funcError);
        } else {
          console.log('[FORM] Notificación enviada correctamente');
        }
      } catch (mailErr) {
        console.error('[FORM] Fallo al disparar notificación:', mailErr);
      }

      dispatch({ type: 'SUBMIT_END', success: true });
      return { success: true };
    } catch (error) {
      console.error('[FORM] Error en submitData:', error);
      dispatch({ type: 'SUBMIT_END', success: false });
      return { 
        success: false, 
        error: error.message || 'Error desconocido al guardar' 
      };
    }
  }, [collectData, formularioId, asignacionId, estado]);

  // finalizarFormulario adaptado para actualizar respuestas y asignaciones
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
      
      const now = new Date().toISOString();
      
      // 1. Marcar como finalizado en la tabla respuestas
      const { error: errorFinalizado } = await supabase
        .from('respuestas')
        .update({
          estado: 'finalizado',
          finalizado_at: now,
          finalizado_por: user.id,
        })
        .eq('asignacion_id', asignacionId);
      
      if (errorFinalizado) {
        console.error('[FORM] Error finalizando en respuestas:', errorFinalizado);
        setFinalizando(false);
        return { error: errorFinalizado };
      }

      // 2. Marcar como finalizado en la tabla asignaciones
      const { error: errorAsignacion } = await supabase
        .from('asignaciones')
        .update({
          estado: 'finalizado',
          finalizado_at: now,
          finalizado_por: user.id,
        })
        .eq('id', asignacionId);

      if (errorAsignacion) {
        console.error('[FORM] Error finalizando en asignaciones:', errorAsignacion);
        setFinalizando(false);
        return { error: errorAsignacion };
      }
      
      setEstado('finalizado');
      setFinalizadoAt(now);
      setFinalizando(false);
      console.log('[FORM] Formulario finalizado correctamente en respuestas y asignaciones');
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
    estado,
    finalizadoAt,
    esReadonly,
    finalizando,
    finalizarFormulario,
    progreso,
    config // Exponemos la config para que FormularioPage la use
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
