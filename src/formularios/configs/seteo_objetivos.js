import SeccionGenerica from '../../components/form/generic/SeccionGenerica';

export const seteoObjetivosConfig = {
  codigo: 'seteo_objetivos',
  storage: 'jsonb', // FormContext detecta esto y guarda en respuestas_json
  pageTitulo: 'Seteo de Objetivos',
  subtitulo: 'Definí los objetivos que orientarán tu proceso en los próximos 12 meses',
  textoBotonFinalizar: 'Finalizar y enviar objetivos',
  footerNote: 'Todo lo expresado aquí es confidencial y forma parte de tu proceso personal de transformación.',

  // Sin DatosIniciales — ya tenemos los datos del coachee de la fase anterior
  datosIniciales: null,

  introduccion: {
    titulo: 'Sentido de esta etapa',
    parrafos: [
      'Después del diagnóstico del Yo Real-Actual, este formulario te invita a definir objetivos concretos para los próximos 12 meses en los doce dominios de vida.',
      'No se trata de fantasías ni de aspiraciones genéricas: la propuesta es que cada objetivo nazca de la brecha real que detectaste en el diagnóstico previo. La sugerencia metodológica es que cada objetivo pueda traducirse luego a una ficha estándar: Objetivo → Indicador → Meta → Hábito semanal → Primer paso → Fecha de revisión.'
    ],
    principios: [
      { numero: 1, titulo: 'Reflexionar', texto: 'Observar el estado actual de cada dominio con honestidad.' },
      { numero: 2, titulo: 'Definir', texto: 'Formular objetivos concretos y medibles para 12 meses.' },
      { numero: 3, titulo: 'Priorizar', texto: 'Identificar los dominios con mayor impacto y los objetivos centrales.' }
    ]
  },

  secciones: [
    // 1. PAREJA
    {
      id: 1,
      titulo: 'Pareja',
      subtitulo: 'Comprensión de la situación deseada y definición de objetivos.',
      componente: SeccionGenerica,
      defaultOpen: true,
      grupos: [
        {
          titulo: 'Comprensión de la situación deseada',
          campos: [
            { tipo: 'textarea', name: 'pareja_relacion_un_anio', label: '¿Cómo te gustaría describir tu relación de pareja dentro de un año?' },
            { tipo: 'textarea', name: 'pareja_aspectos_fortalecer', label: '¿Qué aspectos de la relación te gustaría fortalecer?' },
            { tipo: 'textarea', name: 'pareja_conversaciones_pendientes', label: '¿Qué conversaciones sentís que hoy están pendientes?' },
            { tipo: 'textarea', name: 'pareja_conductas_ayudan', label: '¿Qué conductas tuyas creés que ayudan a la relación?' },
            { tipo: 'textarea', name: 'pareja_conductas_deterioran', label: '¿Qué conductas tuyas creés que la deterioran?' }
          ]
        },
        {
          titulo: 'Definición de objetivos',
          campos: [
            { tipo: 'textarea', name: 'pareja_objetivo_principal', label: '¿Cuál sería el objetivo más importante para este dominio en los próximos 12 meses?' },
            { tipo: 'textarea', name: 'pareja_cambio_concreto', label: '¿Qué cambio concreto te gustaría observar?' },
            { tipo: 'textarea', name: 'pareja_como_sabes_avanzas', label: '¿Cómo sabrías que estás avanzando?' }
          ]
        }
      ],
      get fieldNames() {
        return this.grupos.flatMap(g => g.campos.map(c => c.name));
      }
    },

    // 2. HIJOS / FAMILIA NUCLEAR
    {
      id: 2,
      titulo: 'Hijos / Familia Nuclear',
      subtitulo: 'Tu rol como madre/padre y los vínculos con tus hijos.',
      componente: SeccionGenerica,
      grupos: [
        {
          titulo: 'Reflexión',
          campos: [
            { tipo: 'textarea', name: 'hijos_tipo_padre_madre', label: '¿Qué tipo de padre/madre querés ser?' },
            { tipo: 'textarea', name: 'hijos_recuerdos', label: '¿Qué recuerdos te gustaría que tus hijos tengan de vos?' },
            { tipo: 'textarea', name: 'hijos_presencia_real', label: '¿Qué presencia real tenés hoy en sus vidas?' },
            { tipo: 'textarea', name: 'hijos_hacer_mas', label: '¿Qué te gustaría hacer más?' },
            { tipo: 'textarea', name: 'hijos_dejar_de_hacer', label: '¿Qué te gustaría dejar de hacer?' }
          ]
        },
        {
          titulo: 'Objetivos',
          campos: [
            { tipo: 'textarea', name: 'hijos_objetivo_principal', label: '¿Cuál es el principal objetivo que querés lograr con tus hijos este año?' },
            { tipo: 'textarea', name: 'hijos_habito_semanal', label: '¿Qué hábito semanal podría acercarte a ese objetivo?' }
          ]
        }
      ],
      get fieldNames() { return this.grupos.flatMap(g => g.campos.map(c => c.name)); }
    },

    // 3. FAMILIA DE ORIGEN
    {
      id: 3,
      titulo: 'Familia de Origen',
      subtitulo: 'Padres, hermanos y otros familiares cercanos.',
      componente: SeccionGenerica,
      grupos: [
        {
          titulo: 'Reflexión',
          campos: [
            { tipo: 'textarea', name: 'familia_relacion_actual', label: '¿Cómo evaluás hoy tu relación con padres, hermanos u otros familiares cercanos?' },
            { tipo: 'textarea', name: 'familia_vinculos_reparar', label: '¿Hay vínculos que quisieras reparar?' },
            { tipo: 'textarea', name: 'familia_conversaciones_pendientes', label: '¿Hay conversaciones pendientes?' },
            { tipo: 'textarea', name: 'familia_limites_construir', label: '¿Hay límites que necesitás construir?' }
          ]
        },
        {
          titulo: 'Objetivos',
          campos: [
            { tipo: 'textarea', name: 'familia_que_mejorar', label: '¿Qué te gustaría mejorar en este dominio?' },
            { tipo: 'textarea', name: 'familia_accion_tres_meses', label: '¿Qué acción concreta podrías realizar durante los próximos tres meses?' }
          ]
        }
      ],
      get fieldNames() { return this.grupos.flatMap(g => g.campos.map(c => c.name)); }
    },

    // 4. AMISTADES Y VÍNCULOS SIGNIFICATIVOS
    {
      id: 4,
      titulo: 'Amistades y Vínculos Significativos',
      subtitulo: 'Tu red de apoyo y los vínculos que cultivás.',
      componente: SeccionGenerica,
      grupos: [
        {
          titulo: 'Reflexión',
          campos: [
            { tipo: 'textarea', name: 'amistades_red_apoyo', label: '¿Sentís que contás con una red de apoyo genuina?' },
            { tipo: 'textarea', name: 'amistades_cuidar', label: '¿Qué amistades querés cuidar?' },
            { tipo: 'textarea', name: 'amistades_nutren', label: '¿Qué relaciones hoy te nutren?' },
            { tipo: 'textarea', name: 'amistades_desgastan', label: '¿Qué relaciones te desgastan?' }
          ]
        },
        {
          titulo: 'Objetivos',
          campos: [
            { tipo: 'textarea', name: 'amistades_tipo_vinculos', label: '¿Qué tipo de vínculos querés construir?' },
            { tipo: 'textarea', name: 'amistades_accion_concreta', label: '¿Qué acción concreta podrías sostener para fortalecerlos?' }
          ]
        }
      ],
      get fieldNames() { return this.grupos.flatMap(g => g.campos.map(c => c.name)); }
    },

    // 5. SALUD FÍSICA
    {
      id: 5,
      titulo: 'Salud Física',
      subtitulo: 'Tu cuerpo, tus hábitos y tu vitalidad.',
      componente: SeccionGenerica,
      grupos: [
        {
          titulo: 'Reflexión',
          campos: [
            { tipo: 'textarea', name: 'salud_estado_actual', label: '¿Cómo describirías tu estado de salud actual?' },
            { tipo: 'textarea', name: 'salud_preocupa', label: '¿Qué te preocupa?' },
            { tipo: 'textarea', name: 'salud_habitos_ayudan', label: '¿Qué hábitos te están ayudando?' },
            { tipo: 'textarea', name: 'salud_habitos_perjudican', label: '¿Qué hábitos te están perjudicando?' }
          ]
        },
        {
          titulo: 'Objetivos',
          campos: [
            { tipo: 'textarea', name: 'salud_resultado_12_meses', label: '¿Qué resultado concreto querés lograr en 12 meses?' },
            { tipo: 'textarea', name: 'salud_indicador', label: '¿Qué indicador podrías utilizar para medirlo?' }
          ]
        }
      ],
      get fieldNames() { return this.grupos.flatMap(g => g.campos.map(c => c.name)); }
    },

    // 6. ALIMENTACIÓN Y HÁBITOS
    {
      id: 6,
      titulo: 'Alimentación y Hábitos',
      subtitulo: 'Tu relación con la comida y los hábitos cotidianos.',
      componente: SeccionGenerica,
      grupos: [
        {
          titulo: 'Reflexión',
          campos: [
            { tipo: 'textarea', name: 'alimentacion_relacion_comida', label: '¿Cómo es hoy tu relación con la comida?' },
            { tipo: 'textarea', name: 'alimentacion_consciente_automatica', label: '¿Comés de manera consciente o automática?' },
            { tipo: 'textarea', name: 'alimentacion_habitos_incorporar', label: '¿Qué hábitos alimentarios te gustaría incorporar?' },
            { tipo: 'textarea', name: 'alimentacion_habitos_abandonar', label: '¿Cuáles te gustaría abandonar?' }
          ]
        },
        {
          titulo: 'Objetivos',
          campos: [
            { tipo: 'textarea', name: 'alimentacion_cambio_principal', label: '¿Cuál sería el principal cambio alimentario a lograr este año?' },
            { tipo: 'textarea', name: 'alimentacion_habito_semanal', label: '¿Qué hábito semanal sería clave?' }
          ]
        }
      ],
      get fieldNames() { return this.grupos.flatMap(g => g.campos.map(c => c.name)); }
    },

    // 7. FINANZAS Y PATRIMONIO
    {
      id: 7,
      titulo: 'Finanzas y Patrimonio',
      subtitulo: 'Tu economía y tu relación con el dinero.',
      componente: SeccionGenerica,
      grupos: [
        {
          titulo: 'Reflexión',
          campos: [
            { tipo: 'textarea', name: 'finanzas_situacion_actual', label: '¿Cómo describirías tu situación financiera actual?' },
            { tipo: 'textarea', name: 'finanzas_tranquilidad_preocupacion', label: '¿Te genera tranquilidad o preocupación?' },
            { tipo: 'textarea', name: 'finanzas_relacion_emocional', label: '¿Qué relación emocional tenés con el dinero?' },
            { tipo: 'textarea', name: 'finanzas_administra_reacciona', label: '¿Sentís que administrás o reaccionás?' }
          ]
        },
        {
          titulo: 'Objetivos',
          campos: [
            { tipo: 'textarea', name: 'finanzas_objetivo_anual', label: '¿Qué objetivo financiero querés lograr este año?' },
            { tipo: 'textarea', name: 'finanzas_patrimonio_construir', label: '¿Qué patrimonio te gustaría construir?' },
            { tipo: 'textarea', name: 'finanzas_conducta_desarrollar', label: '¿Qué conducta financiera deberías desarrollar?' }
          ]
        }
      ],
      get fieldNames() { return this.grupos.flatMap(g => g.campos.map(c => c.name)); }
    },

    // 8. TRABAJO / PROFESIÓN
    {
      id: 8,
      titulo: 'Trabajo / Profesión',
      subtitulo: 'Tu vida laboral y profesional.',
      componente: SeccionGenerica,
      grupos: [
        {
          titulo: 'Reflexión',
          campos: [
            { tipo: 'textarea', name: 'trabajo_satisfaccion', label: '¿Qué tan satisfecho estás con tu trabajo actual?' },
            { tipo: 'textarea', name: 'trabajo_entusiasma', label: '¿Qué te entusiasma?' },
            { tipo: 'textarea', name: 'trabajo_drena_energia', label: '¿Qué te drena energía?' },
            { tipo: 'textarea', name: 'trabajo_capacidades_desarrollar', label: '¿Qué capacidades necesitás desarrollar?' }
          ]
        },
        {
          titulo: 'Objetivos',
          campos: [
            { tipo: 'textarea', name: 'trabajo_logro_principal', label: '¿Cuál es el logro profesional más importante para los próximos 12 meses?' },
            { tipo: 'textarea', name: 'trabajo_resultado_impacto', label: '¿Qué resultado tendría verdadero impacto?' }
          ]
        }
      ],
      get fieldNames() { return this.grupos.flatMap(g => g.campos.map(c => c.name)); }
    },

    // 9. PROPÓSITO Y SENTIDO
    {
      id: 9,
      titulo: 'Propósito y Sentido',
      subtitulo: 'El "para qué" de tu vida.',
      componente: SeccionGenerica,
      grupos: [
        {
          titulo: 'Reflexión',
          campos: [
            { tipo: 'textarea', name: 'proposito_para_que', label: '¿Para qué hacés lo que hacés?' },
            { tipo: 'textarea', name: 'proposito_alineada_valores', label: '¿Sentís que tu vida está alineada con tus valores?' },
            { tipo: 'textarea', name: 'proposito_actividades_vivo', label: '¿Qué actividades te hacen sentir más vivo?' },
            { tipo: 'textarea', name: 'proposito_actividades_alejan', label: '¿Qué actividades te alejan de quien querés ser?' }
          ]
        },
        {
          titulo: 'Objetivos',
          campos: [
            { tipo: 'textarea', name: 'proposito_acercar', label: '¿Qué te gustaría acercar más a tu propósito?' },
            { tipo: 'textarea', name: 'proposito_decision_postergada', label: '¿Qué decisión importante venís postergando?' }
          ]
        }
      ],
      get fieldNames() { return this.grupos.flatMap(g => g.campos.map(c => c.name)); }
    },

    // 10. DESARROLLO PERSONAL
    {
      id: 10,
      titulo: 'Desarrollo Personal',
      subtitulo: 'Tu carácter, tus patrones y tus habilidades emocionales.',
      componente: SeccionGenerica,
      grupos: [
        {
          titulo: 'Reflexión',
          campos: [
            { tipo: 'textarea', name: 'desarrollo_caracter_trabajando', label: '¿Qué aspecto de tu carácter estás trabajando?' },
            { tipo: 'textarea', name: 'desarrollo_patron_limita', label: '¿Qué patrón repetitivo te limita?' },
            { tipo: 'textarea', name: 'desarrollo_habilidad_emocional', label: '¿Qué habilidad emocional necesitás desarrollar?' }
          ]
        },
        {
          titulo: 'Objetivos',
          campos: [
            { tipo: 'textarea', name: 'desarrollo_cambio_principal', label: '¿Cuál es el cambio personal más importante que querés lograr?' },
            { tipo: 'textarea', name: 'desarrollo_practica_concreta', label: '¿Qué práctica concreta podría ayudarte?' }
          ]
        }
      ],
      get fieldNames() { return this.grupos.flatMap(g => g.campos.map(c => c.name)); }
    },

    // 11. ESPIRITUALIDAD / TRASCENDENCIA
    {
      id: 11,
      titulo: 'Espiritualidad / Trascendencia',
      subtitulo: 'Independiente de la religión: silencio, conexión, gratitud, servicio.',
      componente: SeccionGenerica,
      grupos: [
        {
          titulo: 'Reflexión',
          campos: [
            { tipo: 'textarea', name: 'espiritualidad_silencio_contemplacion', label: '¿Tenés espacios de silencio o contemplación?' },
            { tipo: 'textarea', name: 'espiritualidad_conexion_mas_grande', label: '¿Sentís conexión con algo más grande que vos?' },
            { tipo: 'textarea', name: 'espiritualidad_gratitud', label: '¿Qué lugar ocupa la gratitud en tu vida?' },
            { tipo: 'textarea', name: 'espiritualidad_servicio', label: '¿Qué lugar ocupa el servicio?' }
          ]
        },
        {
          titulo: 'Objetivos',
          campos: [
            { tipo: 'textarea', name: 'espiritualidad_cultivar', label: '¿Qué te gustaría cultivar en este plano?' },
            { tipo: 'textarea', name: 'espiritualidad_practica', label: '¿Qué práctica podrías incorporar?' }
          ]
        }
      ],
      get fieldNames() { return this.grupos.flatMap(g => g.campos.map(c => c.name)); }
    },

    // 12. RECREACIÓN Y DISFRUTE
    {
      id: 12,
      titulo: 'Recreación y Disfrute',
      subtitulo: 'Tu espacio personal de alegría y descanso.',
      componente: SeccionGenerica,
      grupos: [
        {
          titulo: 'Reflexión',
          campos: [
            { tipo: 'textarea', name: 'recreacion_te_permitis', label: '¿Te permitís disfrutar?' },
            { tipo: 'textarea', name: 'recreacion_alegria_genuina', label: '¿Qué actividades te generan alegría genuina?' },
            { tipo: 'textarea', name: 'recreacion_abandonadas', label: '¿Qué actividades abandonaste y extrañás?' }
          ]
        },
        {
          titulo: 'Objetivos',
          campos: [
            { tipo: 'textarea', name: 'recreacion_espacio_recuperar', label: '¿Qué espacio querés recuperar para vos?' },
            { tipo: 'textarea', name: 'recreacion_experiencia_anio', label: '¿Qué experiencia te gustaría vivir durante este año?' }
          ]
        }
      ],
      get fieldNames() { return this.grupos.flatMap(g => g.campos.map(c => c.name)); }
    },

    // 13. SÍNTESIS — Preguntas integradoras de cierre
    {
      id: 13,
      titulo: 'Síntesis — Preguntas Integradoras',
      subtitulo: 'Para responder una vez completados todos los dominios.',
      componente: SeccionGenerica,
      grupos: [
        {
          titulo: 'Integración',
          campos: [
            { tipo: 'textarea', name: 'sintesis_tres_importantes', label: '¿Cuáles son los tres dominios más importantes para trabajar durante los próximos 12 meses?' },
            { tipo: 'textarea', name: 'sintesis_tres_descuidados', label: '¿Cuáles son los tres dominios más descuidados hoy?' },
            { tipo: 'textarea', name: 'sintesis_mayor_impacto', label: '¿Qué dominio, si mejorara significativamente, produciría el mayor impacto positivo sobre el resto?' },
            { tipo: 'textarea', name: 'sintesis_objetivo_evitado', label: '¿Qué objetivo estás evitando definir por miedo, incomodidad o incertidumbre?' },
            { tipo: 'textarea', name: 'sintesis_gran_anio', label: 'Si dentro de un año tuvieras que decir "fue un gran año", ¿qué tendría que haber ocurrido?', rows: 6 },
            { tipo: 'textarea', name: 'sintesis_cinco_objetivos', label: '¿Cuáles son los cinco objetivos más importantes que surgen de todo este ejercicio?', rows: 8 }
          ]
        }
      ],
      get fieldNames() { return this.grupos.flatMap(g => g.campos.map(c => c.name)); }
    }
  ]
};
