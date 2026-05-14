// src/lib/respuestasSchema.js
// Diccionario completo de secciones y campos del formulario.
// Los keys coinciden EXACTAMENTE con los del JSON guardado en la tabla `respuestas`.

export const SECCIONES_ORDEN = [
  'pulso_actual',
  'dominios_vida',
  'vinculos_hijos',
  'bienestar_interior',
  'limites',
  'patrones',
  'sintesis',
];

export const SECCIONES = {
  pulso_actual: {
    titulo: '1. Pulso Actual',
    descripcion: '¿Cómo te sentís hoy con tu vida en general?',
    campos: [
      { key: 'satisfaccion_general_score', label: 'Satisfacción General', tipo: 'score' },
      { key: 'pulso_datos', label: '¿Qué datos (hechos) justifican ese número?', tipo: 'texto' },
      { key: 'pulso_estado', label: '¿Cómo describirías tu estado predominante hoy?', tipo: 'texto' },
      { key: 'pulso_felicidad', label: '¿Qué cosas te están dando felicidad hoy?', tipo: 'texto' },
      { key: 'pulso_atencion', label: '¿Qué cosas te están robando energía o atención?', tipo: 'texto' },
    ],
  },

  dominios_vida: {
    titulo: '2. Los 5 Dominios de Vida',
    descripcion: 'Mapeo detallado de las áreas fundamentales.',
    campos: [
      // Vínculos y Relaciones
      { key: 'vinculos_y_relaciones_score', label: 'Vínculos y Relaciones — Escala', tipo: 'score' },
      { key: 'vinculos_y_relaciones_estado', label: 'Vínculos y Relaciones — ¿Cómo está hoy, concretamente?', tipo: 'texto' },
      { key: 'vinculos_y_relaciones_patron', label: 'Vínculos y Relaciones — ¿Qué patrón tuyo se repite en este dominio?', tipo: 'texto' },
      { key: 'vinculos_y_relaciones_necesita', label: 'Vínculos y Relaciones — ¿Qué necesita atención, orden o corrección?', tipo: 'texto' },
      // Salud y Vitalidad
      { key: 'salud_y_vitalidad_score', label: 'Salud y Vitalidad — Escala', tipo: 'score' },
      { key: 'salud_y_vitalidad_estado', label: 'Salud y Vitalidad — ¿Cómo está hoy, concretamente?', tipo: 'texto' },
      { key: 'salud_y_vitalidad_patron', label: 'Salud y Vitalidad — ¿Qué patrón tuyo se repite en este dominio?', tipo: 'texto' },
      { key: 'salud_y_vitalidad_necesita', label: 'Salud y Vitalidad — ¿Qué necesita atención, orden o corrección?', tipo: 'texto' },
      // Propósito y Carrera
      { key: 'proposito_y_carrera_score', label: 'Propósito y Carrera — Escala', tipo: 'score' },
      { key: 'proposito_y_carrera_estado', label: 'Propósito y Carrera — ¿Cómo está hoy, concretamente?', tipo: 'texto' },
      { key: 'proposito_y_carrera_patron', label: 'Propósito y Carrera — ¿Qué patrón tuyo se repite en este dominio?', tipo: 'texto' },
      { key: 'proposito_y_carrera_necesita', label: 'Propósito y Carrera — ¿Qué necesita atención, orden o corrección?', tipo: 'texto' },
      // Finanzas y Abundancia
      { key: 'finanzas_y_abundancia_score', label: 'Finanzas y Abundancia — Escala', tipo: 'score' },
      { key: 'finanzas_y_abundancia_estado', label: 'Finanzas y Abundancia — ¿Cómo está hoy, concretamente?', tipo: 'texto' },
      { key: 'finanzas_y_abundancia_patron', label: 'Finanzas y Abundancia — ¿Qué patrón tuyo se repite en este dominio?', tipo: 'texto' },
      { key: 'finanzas_y_abundancia_necesita', label: 'Finanzas y Abundancia — ¿Qué necesita atención, orden o corrección?', tipo: 'texto' },
      // Entorno y Estilo de Vida
      { key: 'entorno_y_estilo_de_vida_score', label: 'Entorno y Estilo de Vida — Escala', tipo: 'score' },
      { key: 'entorno_y_estilo_de_vida_estado', label: 'Entorno y Estilo de Vida — ¿Cómo está hoy, concretamente?', tipo: 'texto' },
      { key: 'entorno_y_estilo_de_vida_patron', label: 'Entorno y Estilo de Vida — ¿Qué patrón tuyo se repite en este dominio?', tipo: 'texto' },
      { key: 'entorno_y_estilo_de_vida_necesita', label: 'Entorno y Estilo de Vida — ¿Qué necesita atención, orden o corrección?', tipo: 'texto' },
    ],
  },

  vinculos_hijos: {
    titulo: '3. Vínculos y Maternidad/Paternidad',
    descripcion: 'La profundidad de tus relaciones primarias.',
    campos: [
      // Hijo/a 1
      { key: 'hijo_1_nombre', label: 'Nombre del hijo/a 1', tipo: 'texto' },
      { key: 'hijo_1_score', label: 'Hijo/a 1 — Escala del vínculo', tipo: 'score' },
      { key: 'hijo_1_necesita', label: 'Hijo/a 1 — ¿Qué necesita más presencia, cuidado o reparación?', tipo: 'texto' },
      { key: 'hijo_1_patron', label: 'Hijo/a 1 — ¿Qué patrón tuyo aparece con frecuencia en este vínculo?', tipo: 'texto' },
      { key: 'hijo_1_gesto', label: 'Hijo/a 1 — ¿Qué gesto concreto podrías hacer este mes para fortalecerlo?', tipo: 'texto' },
      // Hijo/a 2
      { key: 'hijo_2_nombre', label: 'Nombre del hijo/a 2', tipo: 'texto' },
      { key: 'hijo_2_score', label: 'Hijo/a 2 — Escala del vínculo', tipo: 'score' },
      { key: 'hijo_2_necesita', label: 'Hijo/a 2 — ¿Qué necesita más presencia, cuidado o reparación?', tipo: 'texto' },
      { key: 'hijo_2_patron', label: 'Hijo/a 2 — ¿Qué patrón tuyo aparece con frecuencia en este vínculo?', tipo: 'texto' },
      { key: 'hijo_2_gesto', label: 'Hijo/a 2 — ¿Qué gesto concreto podrías hacer este mes para fortalecerlo?', tipo: 'texto' },
    ],
  },

  bienestar_interior: {
    titulo: '4. Bienestar Interior y Mentalidad',
    descripcion: 'Observando el mundo interno: pensamientos y emociones.',
    campos: [
      { key: 'bienestar_interior_score', label: 'Nivel de Bienestar Interior', tipo: 'score' },
      { key: 'emociones_conciencia', label: '¿Qué tan consciente sos de tus emociones diarias?', tipo: 'texto' },
      { key: 'dialogo_interno', label: '¿Cómo es tu diálogo interno hoy? ¿Qué te decís?', tipo: 'texto' },
      { key: 'mente_creativa', label: '¿En qué medida sentís que tu mente es creativa vs reactiva?', tipo: 'texto' },
      { key: 'miedos', label: 'Principales miedos', tipo: 'texto' },
      { key: 'apegos', label: 'Principales apegos', tipo: 'texto' },
      { key: 'limita', label: '¿Qué creencia sentís que te limita hoy?', tipo: 'texto' },
      { key: 'centro', label: '¿Qué te devuelve a tu centro cuando lo perdés?', tipo: 'texto' },
      { key: 'criticas', label: '¿Cómo manejás la crítica (propia y ajena)?', tipo: 'texto' },
    ],
  },

  limites: {
    titulo: '5. Límites y Relación con Uno Mismo',
    descripcion: 'Capacidad de decir NO y de cuidarse.',
    campos: [
      { key: 'limites_personales_score', label: 'Capacidad de poner límites', tipo: 'score' },
      { key: 'limites_donde', label: '¿En qué área te cuesta más poner límites?', tipo: 'texto' },
      { key: 'limites_costo', label: '¿Cuál es el costo de no poner esos límites?', tipo: 'texto' },
      { key: 'autocompasion_score', label: 'Nivel de Autocompasión', tipo: 'score' },
      { key: 'amor_propio', label: '¿Cómo practicás el amor propio concretamente?', tipo: 'texto' },
      { key: 'perdon_propio', label: '¿Qué necesitás perdonarte?', tipo: 'texto' },
      { key: 'perdon_otros', label: '¿A quién necesitás perdonar?', tipo: 'texto' },
      { key: 'expresion_sentimientos', label: '¿Qué tan fácil te resulta expresar lo que sentís?', tipo: 'texto' },
    ],
  },

  patrones: {
    titulo: '6. Patrones, Decisiones y Automatismos',
    descripcion: 'Identificando lo que se repite y lo que está pendiente.',
    campos: [
      { key: 'patrones_repetidos', label: '¿Qué situación o conflicto sentís que se repite en tu vida?', tipo: 'texto' },
      { key: 'automaticos', label: '¿Cuáles son tus principales \'automáticos\' (reacciones inconscientes)?', tipo: 'texto' },
      { key: 'conversacion_pendiente', label: '¿Qué conversación tenés pendiente y con quién?', tipo: 'texto' },
      { key: 'decision_pendiente', label: '¿Qué decisión sabés que tenés que tomar pero venís postergando?', tipo: 'texto' },
      { key: 'beneficio_oculto', label: '¿Cuál es el \'beneficio oculto\' de no tomar esa decisión?', tipo: 'texto' },
      { key: 'versiones', label: '¿Qué versión de vos mismo/a sentís que ya caducó?', tipo: 'texto' },
    ],
  },

  sintesis: {
    titulo: '7. Síntesis y Compromiso con el Cambio',
    descripcion: 'Cerrando el diagnóstico y abriendo la brecha.',
    campos: [
      { key: 'descubrimiento', label: '¿Cuál fue tu mayor descubrimiento al completar este mapa?', tipo: 'texto' },
      { key: 'brecha', label: '¿Cómo describirías hoy la brecha entre tu Yo Real y tu Yo Ideal?', tipo: 'texto' },
      { key: 'prioridades', label: '¿En qué áreas sentís que necesitás trabajar con más urgencia?', tipo: 'lista' },
      { key: 'tres_temas', label: 'Si tuvieras que elegir SOLO 3 temas para tu proceso de coaching, ¿cuáles serían?', tipo: 'texto' },
      { key: 'compromiso', label: 'Nivel de compromiso: ¿Qué estás dispuesto/a a soltar para que lo nuevo aparezca?', tipo: 'texto' },
    ],
  },
};
