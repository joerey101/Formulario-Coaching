import { useEffect, useRef } from 'react';
import { useForm } from '../context/FormContext';

const STORAGE_KEY = 'yo_real_actual_react';

export default function useAutoSave() {
  const { state, setAll } = useForm();
  const loaded = useRef(false);

  // Cargar borrador al montar
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        setAll({
          meta: saved.meta || state.meta,
          respuestas: saved.respuestas || {}
        });
      }
    } catch (e) {
      console.warn('Error loading draft:', e);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Guardar manualmente
  const save = () => {
    const data = { meta: state.meta, respuestas: state.respuestas };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    alert('Borrador guardado en este navegador.');
  };

  // Limpiar
  const clear = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  return { save, clear };
}
