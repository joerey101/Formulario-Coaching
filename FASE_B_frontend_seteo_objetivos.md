# FASE B — Frontend: Formulario "Seteo de Objetivos"

**Ejecutor:** Antigravity (local, branch `react-migration`)
**Prerequisito:** Fase A (SQL en Supabase) ya ejecutada con todos los OK
**Documentos a leer antes:** `ARQUITECTURA_multi_formulario.md`, `ESTADO_ACTUAL_PROYECTO.md`
**Reglas:** NO commit, NO push. José prueba local y pushea manualmente.

---

## ⚠️ CONTEXTO CRÍTICO ANTES DE EMPEZAR

**Lo que NO se toca bajo ninguna circunstancia:**
- `src/formularios/configs/yo_real_actual.js`
- `src/components/form/Seccion1.jsx` a `Seccion7.jsx`
- `src/components/form/DatosIniciales.jsx`
- `src/components/form/IntroduccionPanel.jsx`
- Las preguntas, schema o lógica del formulario "Yo Real-Actual"
- El trigger de onboarding automático en Supabase
- La Edge Function `send-form-notification`
- Auth, Hub, routing

**Lo que SÍ se toca:**
- `src/context/FormContext.jsx` (extender para soportar storage JSONB)
- `src/formularios/configs/index.js` (registrar nuevo formulario)
- `src/pages/AdminPage.jsx` (renderizar JSONB en el modal de detalle)

**Lo que SE CREA nuevo:**
- `src/components/form/generic/CampoTextarea.jsx`
- `src/components/form/generic/SeccionGenerica.jsx`
- `src/components/form/generic/SeccionGenerica.css`
- `src/formularios/configs/seteo_objetivos.js`

---

## ARQUITECTURA DE LA SOLUCIÓN

**Patrón establecido:** componentes específicos (Seccion1-7) por formulario.

**Nuevo patrón (a partir de Seteo de Objetivos):** componentes **genéricos declarativos**.

La config declara las secciones y sus preguntas; un componente genérico las renderiza. A partir de acá, agregar un formulario nuevo = escribir un archivo de config, sin tocar React.

**Coexistencia:** Yo Real-Actual mantiene sus componentes específicos. Seteo de Objetivos y formularios futuros usan los genéricos.

**Storage:** Yo Real-Actual usa columnas legacy de `respuestas`. Seteo de Objetivos usa `respuestas_json` (JSONB) declarado en la config con `storage: 'jsonb'`.

---

## PASO 1 — Checkpoint inicial: mostrar archivos relevantes

Antes de tocar nada, leé y reportá en el chat el contenido completo de:

1. `src/context/FormContext.jsx` (entero)
2. `src/pages/AdminPage.jsx` (entero)
3. `src/formularios/configs/index.js`
4. `src/formularios/configs/yo_real_actual.js` (solo la estructura: keys top-level)
5. Listar contenido de `src/components/form/`

**No avances hasta que José o Claude den luz verde con el plan de modificaciones concretas.**

---

## PASO 2 — Crear `src/components/form/generic/CampoTextarea.jsx`

Componente reutilizable para un campo de texto largo con label, hint opcional y autosave a través del context.

```jsx
import React from 'react';
import { useForm } from '../../../context/FormContext';

/**
 * Campo de textarea genérico. Lee y escribe en state.respuestas[name] del FormContext.
 *
 * Props:
 * - name: string — clave del campo en respuestas (ej: 'pareja_relacion_un_anio')
 * - label: string — pregunta visible
 * - hint?: string — texto auxiliar bajo la pregunta
 * - rows?: number — altura del textarea (default 4)
 * - placeholder?: string
 * - readOnly?: boolean — si true, no permite editar (modo finalizado)
 */
const CampoTextarea = ({ name, label, hint, rows = 4, placeholder, readOnly = false }) => {
  const { state, setRespuesta } = useForm();
  const value = state.respuestas?.[name] || '';

  const handleChange = (e) => {
    if (readOnly) return;
    setRespuesta(name, e.target.value);
  };

  return (
    <div className="campo-textarea">
      <label htmlFor={name} className="campo-textarea-label">
        {label}
      </label>
      {hint && <p className="campo-textarea-hint">{hint}</p>}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        rows={rows}
        placeholder={placeholder}
        readOnly={readOnly}
        className="campo-textarea-input"
      />
    </div>
  );
};

export default CampoTextarea;
```

---

## PASO 3 — Crear `src/components/form/generic/SeccionGenerica.jsx`

Componente que renderiza una sección a partir de la config declarativa. No conoce el formulario; solo lee la prop `seccion`.

```jsx
import React from 'react';
import CampoTextarea from './CampoTextarea';
import { useForm } from '../../../context/FormContext';
import './SeccionGenerica.css';

/**
 * Renderiza una sección a partir de su config declarativa.
 *
 * La sección puede tener subgrupos (ej: "Reflexión" / "Objetivos") y campos.
 *
 * Props:
 * - seccion: objeto de config con shape:
 *   {
 *     id: number,
 *     titulo: string,
 *     subtitulo?: string,
 *     grupos: [
 *       {
 *         titulo: string,
 *         campos: [{ tipo: 'textarea', name, label, hint?, rows? }]
 *       }
 *     ]
 *   }
 */
const SeccionGenerica = ({ seccion }) => {
  const { state } = useForm();
  const readOnly = state.estado === 'finalizado';

  return (
    <div className="seccion-generica">
      {seccion.subtitulo && (
        <p className="seccion-generica-subtitulo">{seccion.subtitulo}</p>
      )}

      {seccion.grupos?.map((grupo, gIdx) => (
        <div key={gIdx} className="seccion-generica-grupo">
          {grupo.titulo && (
            <h3 className="seccion-generica-grupo-titulo">{grupo.titulo}</h3>
          )}

          {grupo.campos.map((campo) => {
            if (campo.tipo === 'textarea') {
              return (
                <CampoTextarea
                  key={campo.name}
                  name={campo.name}
                  label={campo.label}
                  hint={campo.hint}
                  rows={campo.rows}
                  placeholder={campo.placeholder}
                  readOnly={readOnly}
                />
              );
            }
            // Espacio para extender con otros tipos en el futuro (score, select, etc.)
            return null;
          })}
        </div>
      ))}
    </div>
  );
};

export default SeccionGenerica;
```

---

## PASO 4 — Crear `src/components/form/generic/SeccionGenerica.css`

Mantener consistencia con el branding violeta y la tipografía existente.

```css
.seccion-generica {
  padding: 0;
}

.seccion-generica-subtitulo {
  color: var(--text-secondary, #6b7280);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.seccion-generica-grupo {
  margin-bottom: 2rem;
}

.seccion-generica-grupo-titulo {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--primary-color, #6d28d9);
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-light, #e5e7eb);
}

.campo-textarea {
  margin-bottom: 1.5rem;
}

.campo-textarea-label {
  display: block;
  font-weight: 500;
  color: var(--text-primary, #1f2937);
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.campo-textarea-hint {
  font-size: 0.85rem;
  color: var(--text-secondary, #6b7280);
  margin: -0.25rem 0 0.5rem 0;
}

.campo-textarea-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-medium, #d1d5db);
  border-radius: 0.5rem;
  font-family: inherit;
  font-size: 0.95rem;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.15s ease;
}

.campo-textarea-input:focus {
  outline: none;
  border-color: var(--primary-color, #6d28d9);
  box-shadow: 0 0 0 3px rgba(109, 40, 217, 0.1);
}

.campo-textarea-input[readonly] {
  background-color: var(--bg-readonly, #f9fafb);
  cursor: default;
}
```

---

## PASO 5 — Crear `src/formularios/configs/seteo_objetivos.js`

Config declarativa con los 12 dominios + sección de cierre. **Las preguntas son las exactas del documento provisto por José.**

```javascript
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
```

---

## PASO 6 — Registrar el formulario en `src/formularios/configs/index.js`

Editar el archivo existente, agregar el nuevo formulario al objeto `configs`:

```javascript
import { yoRealActualConfig } from './yo_real_actual';
import { seteoObjetivosConfig } from './seteo_objetivos';

const configs = {
  yo_real_actual: yoRealActualConfig,
  seteo_objetivos: seteoObjetivosConfig,  // ← NUEVO
};

export const getFormularioConfig = (codigo) => {
  const config = configs[codigo];
  if (!config) {
    throw new Error(`[FORM] No existe configuración para el formulario "${codigo}"`);
  }
  return config;
};

export const getCodigosDisponibles = () => Object.keys(configs);

export const getFieldNames = (config) => {
  // Compatibilidad con dos estructuras: secciones con fieldNames directos (legacy)
  // o secciones con grupos (nuevo patrón declarativo)
  return config.secciones.flatMap(s => s.fieldNames || []);
};
```

---

## PASO 7 — Refactor `src/context/FormContext.jsx`

**Checkpoint antes de editar:** mostrar el archivo actual completo. José o Claude revisan y dan luz verde con el diff exacto.

**Cambios necesarios:**

1. Leer `config.storage` (default `'columns'` para Yo Real-Actual, `'jsonb'` para Seteo de Objetivos).

2. En la función de cargar respuestas desde Supabase:
   - Si `storage === 'jsonb'`: hidratar el state desde `data.respuestas_json` (objeto plano).
   - Si `storage === 'columns'`: comportamiento actual (cada columna a su key).

3. En la función de guardar (UPSERT en `respuestas`):
   - Si `storage === 'jsonb'`: construir un único objeto con todas las respuestas y guardarlo en `respuestas_json`. Las columnas individuales del Yo Real-Actual quedan NULL.
   - Si `storage === 'columns'`: comportamiento actual.

4. En la lógica de finalizar/reabrir: sin cambios, ya opera sobre `asignaciones` que es genérica.

**Patrón sugerido del save (pseudo-código):**

```javascript
const buildPayload = () => {
  const base = {
    user_id: user.id,
    email: user.email,
    asignacion_id: asignacionId,
    formulario_id: formularioId,
    estado: state.estado,
    // ...meta del DatosIniciales si la config lo tiene
  };

  if (config.storage === 'jsonb') {
    return { ...base, respuestas_json: state.respuestas };
  } else {
    // Columns legacy: spread de respuestas como columnas
    return { ...base, ...state.respuestas };
  }
};
```

**Reglas estrictas:**
- NO modificar el comportamiento para `codigo === 'yo_real_actual'`.
- El guardado de Yo Real-Actual debe seguir produciendo EXACTAMENTE el mismo SQL que produce hoy.
- Agregar logs `[FORM]` para distinguir qué path se ejecutó (columns vs jsonb).

---

## PASO 8 — Refactor `src/pages/AdminPage.jsx`

**Checkpoint antes de editar:** mostrar el archivo actual completo.

**Cambios necesarios:**

En el modal de detalle de una respuesta, detectar el `formulario_id` (o `formulario.codigo` vía JOIN) y renderizar de manera correspondiente:

1. Si el formulario es `yo_real_actual` → comportamiento actual (lectura de columnas vía `respuestasSchema.js`).

2. Si el formulario es `seteo_objetivos` (o cualquier formulario con storage jsonb) → leer la config con `getFormularioConfig(codigo)`, recorrer `secciones[].grupos[].campos[]`, y para cada campo mostrar `{ label, valor: respuestas_json[name] }` con la misma estructura visual (sección/título/pregunta/respuesta) que ya usa Yo Real-Actual.

3. Saltar campos sin valor (no mostrar "sin respuesta").

4. Saltar secciones enteras si ninguno de sus campos tiene valor.

**Patrón sugerido (pseudo-código):**

```javascript
const renderRespuestas = (item) => {
  const codigo = item.formulario?.codigo;
  
  if (codigo === 'yo_real_actual') {
    return renderRespuestasLegacy(item); // función actual
  }
  
  // Genérico para cualquier formulario jsonb
  const config = getFormularioConfig(codigo);
  const respuestas = item.respuestas_json || {};
  
  return config.secciones.map(seccion => {
    const camposConValor = seccion.grupos
      .flatMap(g => g.campos.map(c => ({ ...c, grupoTitulo: g.titulo })))
      .filter(c => respuestas[c.name]?.trim());
    
    if (camposConValor.length === 0) return null;
    
    return (
      <div key={seccion.id} className="seccion-respuestas">
        <h3 className="seccion-titulo">{seccion.titulo}</h3>
        {camposConValor.map(campo => (
          <div key={campo.name} className="campo-respuesta">
            <label className="campo-label">{campo.label}</label>
            <div className="campo-valor"><p>{respuestas[campo.name]}</p></div>
          </div>
        ))}
      </div>
    );
  });
};
```

5. La query del listado de admin debe incluir `respuestas_json` y un JOIN al formulario para obtener el `codigo`. Verificar que ya lo haga (post-Fase 1.D mínima incluyó JOIN a asignaciones). Si no incluye `respuestas_json`, agregarlo al SELECT.

---

## PASO 9 — Build local

```bash
npm run build
```

Si falla, reportar el error completo y NO seguir.

---

## PASO 10 — Test local (José ejecuta, NO Antigravity)

```bash
npm run dev
```

**Plan de prueba que José ejecuta:**

1. Login con un coachee activo (cualquiera de los 2 que recibieron la asignación)
2. Hub muestra **2 cards**:
   - Yo Real-Actual (estado actual: finalizado o en_progreso, según corresponda)
   - Seteo de Objetivos (estado: no iniciado, habilitado)
3. Click en card "Seteo de Objetivos" → entra al formulario
4. Verificar:
   - Título correcto, intro correcto, 13 secciones
   - Las preguntas se ven legibles, no snake_case
   - Cada sección tiene sus dos grupos (Reflexión / Objetivos), excepto Síntesis que tiene uno
5. Llenar 2-3 preguntas en distintas secciones, salir del formulario
6. Volver a entrar → las respuestas persistieron
7. Login como Juan Ortiz (coach) en `/admin`
8. Ver listado → debe aparecer la nueva fila del coachee con formulario "Seteo de Objetivos"
9. Click en el ojo → modal de detalle muestra las preguntas legibles con las respuestas
10. Volver al coachee, completar todo (o casi), finalizar
11. Verificar que el email llega al coach y que el estado pasa a `finalizado`
12. Verificar que Yo Real-Actual del MISMO coachee sigue intacto (no se mezclaron datos)

---

## PASO 11 — Reporte final al chat

```
PASO 1 (checkpoint inicial archivos): OK / FALLA
PASO 2 (CampoTextarea.jsx): OK / FALLA
PASO 3 (SeccionGenerica.jsx): OK / FALLA
PASO 4 (SeccionGenerica.css): OK / FALLA
PASO 5 (seteo_objetivos.js): OK / FALLA — total fieldNames: [N]
PASO 6 (configs/index.js): OK / FALLA
PASO 7 (FormContext.jsx): OK / FALLA — checkpoint con José: SI / NO
PASO 8 (AdminPage.jsx): OK / FALLA — checkpoint con José: SI / NO
PASO 9 (npm run build): OK / FALLA — output: [...]
```

**No hacer commit ni push.** José prueba y pushea manualmente.

---

## Resumen de archivos tocados

**Creados:**
- `src/components/form/generic/CampoTextarea.jsx`
- `src/components/form/generic/SeccionGenerica.jsx`
- `src/components/form/generic/SeccionGenerica.css`
- `src/formularios/configs/seteo_objetivos.js`

**Modificados:**
- `src/formularios/configs/index.js`
- `src/context/FormContext.jsx`
- `src/pages/AdminPage.jsx`

**NO TOCADOS (verificar al final):**
- `src/formularios/configs/yo_real_actual.js`
- `src/components/form/Seccion1.jsx` a `Seccion7.jsx`
- `src/components/form/DatosIniciales.jsx`
- `src/components/form/IntroduccionPanel.jsx`
- `src/hooks/useAsignaciones.js`
- `src/pages/HubCoachee.jsx`
- `src/pages/FormularioPage.jsx`
- `src/context/AuthContext.jsx`
- Trigger de Supabase
- Edge Function de email
