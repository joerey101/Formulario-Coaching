import { useMemo } from 'react';
import { useForm, DOMAIN_NAMES, slug } from '../context/FormContext';

// Todos los campos que deben ser respondidos para calcular progreso
function getAllFieldNames() {
  const names = [];

  // Pulso
  names.push('satisfaccion_general_score', 'pulso_datos', 'pulso_estado', 'pulso_felicidad', 'pulso_atencion');

  // Dominios
  DOMAIN_NAMES.forEach((d) => {
    const s = slug(d);
    names.push(`${s}_score`, `${s}_estado`, `${s}_patron`, `${s}_necesita`);
  });

  // Hijos
  [1, 2].forEach((i) => {
    names.push(`hijo_${i}_nombre`, `hijo_${i}_score`, `hijo_${i}_necesita`, `hijo_${i}_patron`, `hijo_${i}_gesto`);
  });

  // Bienestar
  names.push('bienestar_interior_score', 'emociones_conciencia', 'dialogo_interno', 'mente_creativa', 'miedos', 'apegos', 'limita', 'centro', 'criticas');

  // Límites
  names.push('limites_personales_score', 'limites_donde', 'limites_costo', 'autocompasion_score', 'amor_propio', 'perdon_propio', 'perdon_otros', 'expresion_sentimientos');

  // Patrones
  names.push('patrones_repetidos', 'automaticos', 'conversacion_pendiente', 'decision_pendiente', 'beneficio_oculto', 'versiones');

  // Brecha
  names.push('descubrimiento', 'brecha', 'prioridades', 'tres_temas', 'compromiso');

  return names;
}

export default function useFormProgress() {
  const { state } = useForm();
  const fieldNames = useMemo(() => getAllFieldNames(), []);

  const { answered, percent } = useMemo(() => {
    let count = 0;
    fieldNames.forEach((name) => {
      const val = state.respuestas[name];
      if (val === undefined || val === null || val === '') return;
      if (Array.isArray(val) && val.length === 0) return;
      count++;
    });
    return {
      answered: count,
      percent: fieldNames.length ? Math.round((count / fieldNames.length) * 100) : 0
    };
  }, [state.respuestas, fieldNames]);

  return { answered, total: fieldNames.length, percent };
}
