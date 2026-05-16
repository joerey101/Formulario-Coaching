# FASE 1.C — Refactor del FormContext para soportar N formularios

**Proyecto:** Sistema Multi-Formulario CONSCIENCIA
**Documento de arquitectura:** `ARQUITECTURA_multi_formulario.md` (raíz del proyecto)
**Estado previo:** Fase 1.A (modelo de datos) ✅ y Fase 1.B (hub + routing) ✅ en producción
**Ejecutor:** Antigravity
**Workflow:** Antigravity ejecuta y muestra archivos. José testea local y pushea manualmente. **NO commit ni push desde Antigravity.**

---

## ⚠️ ANTES DE EJECUTAR NADA

1. Leé `ARQUITECTURA_multi_formulario.md` para el contexto general del sistema multi-formulario.
2. Leé `ESTADO_ACTUAL_PROYECTO.md` para entender qué hay hecho hoy.
3. Confirmá que estás parado en la branch `react-migration`.
4. Confirmá que `npm run dev` levanta bien en local antes de tocar nada.

---

## OBJETIVO DE ESTA FASE

Hoy el `FormContext.jsx` está hardcoded para "Yo Real-Actual":
- `fieldNames` es un array fijo dentro del context
- El guardado en `respuestas` no incluye `formulario_id` ni `asignacion_id`
- El `FormularioPage` asume que siempre se trabaja con el mismo formulario

Después de esta fase:
- Cada formulario declara su propia configuración (secciones + fieldNames para progreso) en un archivo de config externo
- `FormContext` recibe `codigo` del formulario por prop/parámetro y carga la config correspondiente
- El guardado incluye `formulario_id` y `asignacion_id` correctamente
- Agregar un formulario nuevo (ej: Bienvenida) en Fase 2 NO requiere tocar `FormContext`, solo crear un archivo de config nuevo y los componentes de secciones

**Importante:** esta fase NO debe romper nada visible. El usuario sigue viendo y usando "Yo Real-Actual" exactamente igual que hoy. Es refactor interno.

---

## PASO 0 — Inspección inicial (NO modificar nada)

Antes de tocar código, leé y reportá en el chat:

1. Contenido completo actual de:
   - `src/context/FormContext.jsx`
   - `src/pages/FormularioPage.jsx`
   - `src/utils/respuestasSchema.js` (o donde esté el mapeo keys → labels)

2. Listá los archivos de componentes de las 7 secciones del formulario "Yo Real-Actual" (probablemente bajo `src/components/form/` o similar).

3. Confirmá dónde se hace el `INSERT`/`UPSERT` a la tabla `respuestas`. Si está dentro de `FormContext`, anotá la función exacta.

**Checkpoint 1:** Reportá esto al chat antes de pasar al Paso 1.

---

## PASO 1 — Crear estructura de configuración por formulario

### 1.1 — Crear carpeta de configs

```
src/
└── formularios/
    └── configs/
        └── yo_real_actual.js
```

### 1.2 — Estructura del archivo `yo_real_actual.js`

Crear `src/formularios/configs/yo_real_actual.js` con esta forma:

```javascript
// Configuración del formulario "Yo Real-Actual"
// Esta config se carga desde FormContext según el código del formulario activo.

import Seccion1 from '../../components/form/Seccion1';
import Seccion2 from '../../components/form/Seccion2';
import Seccion3 from '../../components/form/Seccion3';
import Seccion4 from '../../components/form/Seccion4';
import Seccion5 from '../../components/form/Seccion5';
import Seccion6 from '../../components/form/Seccion6';
import Seccion7 from '../../components/form/Seccion7';

// ⚠️ Ajustar los imports de arriba a los nombres reales de los componentes
// que existen hoy en el proyecto (probablemente tengan otros nombres).
// Esta lista es ilustrativa: leé cómo están importados hoy en FormularioPage.jsx
// y replicá esos imports acá.

export const yoRealActualConfig = {
  codigo: 'yo_real_actual',
  titulo: 'Yo Real-Actual',

  // Array ordenado de secciones del formulario.
  // Cada sección tiene: id, titulo, componente y los fieldNames que aporta
  // al cálculo de progreso global.
  secciones: [
    {
      id: 1,
      titulo: 'Datos personales',
      componente: Seccion1,
      fieldNames: [
        // listar TODOS los fieldNames de la sección 1 que cuentan para progreso
      ],
    },
    {
      id: 2,
      titulo: 'Familia',
      componente: Seccion2,
      fieldNames: [
        // ...
      ],
    },
    // ... resto de secciones (3 a 7) con sus fieldNames
  ],
};

// Helper: devuelve todos los fieldNames del formulario (flatten de todas las secciones).
// Esto reemplaza el array hardcoded que hoy vive en FormContext.
export const getFieldNames = (config) =>
  config.secciones.flatMap((s) => s.fieldNames);
```

**Acción concreta para Antigravity:**

1. Abrí el `FormContext.jsx` actual y extraé el array de `fieldNames` que está hardcoded ahí.
2. Abrí `FormularioPage.jsx` actual y mirá cómo se renderizan las 7 secciones (probablemente hay un switch/array de componentes).
3. Distribuí los `fieldNames` por sección según corresponda (usando el sentido común: si una sección tiene campos `nombre`, `apellido`, `fecha_nac`, esos van en `fieldNames` de esa sección).
4. Generá el archivo `yo_real_actual.js` con los imports y la estructura armada.
5. Mostrá el archivo completo en el chat antes de pasar al paso siguiente.

**Checkpoint 2:** Reportá el archivo `yo_real_actual.js` completo. José revisa que los `fieldNames` estén bien distribuidos.

### 1.3 — Crear índice de configs

Crear `src/formularios/configs/index.js`:

```javascript
import { yoRealActualConfig } from './yo_real_actual';
// import { bienvenidaConfig } from './bienvenida';  // Se sumará en Fase 2

// Mapa de código → config. Para agregar un formulario nuevo en el futuro:
// 1. Crear su archivo de config (ej: bienvenida.js)
// 2. Importarlo arriba y agregarlo a este objeto
// 3. Listo. FormContext lo carga solo.
const configs = {
  yo_real_actual: yoRealActualConfig,
  // bienvenida: bienvenidaConfig,
};

export const getFormularioConfig = (codigo) => {
  const config = configs[codigo];
  if (!config) {
    throw new Error(`[FORM] No existe configuración para el formulario "${codigo}"`);
  }
  return config;
};

export const getCodigosDisponibles = () => Object.keys(configs);
```

---

## PASO 2 — Refactorizar FormContext

### 2.1 — Cambios principales

El `FormContext` actual probablemente tiene esta forma (resumen):

```javascript
// ANTES (resumido)
const FormContext = createContext();

const fieldNames = ['campo1', 'campo2', ...];  // hardcoded

export const FormProvider = ({ children }) => {
  const [respuestas, setRespuestas] = useState({});
  const [estado, setEstado] = useState('en_progreso');
  // ...
  const guardarRespuestas = async () => {
    await supabase.from('respuestas').upsert({ ...respuestas, user_id });
  };
  // ...
};
```

Refactorizar a:

```javascript
// DESPUÉS (resumido)
import { getFormularioConfig, getFieldNames } from '../formularios/configs';

const FormContext = createContext();

export const FormProvider = ({ children, codigo, asignacionId }) => {
  // codigo: 'yo_real_actual' | 'bienvenida' | ...
  // asignacionId: UUID de la asignación activa
  const config = useMemo(() => getFormularioConfig(codigo), [codigo]);
  const fieldNames = useMemo(() => getFieldNames(config), [config]);

  const [respuestas, setRespuestas] = useState({});
  const [estado, setEstado] = useState('en_progreso');
  const [formularioId, setFormularioId] = useState(null);

  // 1. Al montar: cargar la respuesta existente (si hay) filtrando por
  //    formulario_id y asignacion_id. Si no existe, dejar respuestas={}.
  useEffect(() => {
    const cargar = async () => {
      // Buscar el formulario_id en la tabla formularios por su codigo
      const { data: form } = await supabase
        .from('formularios')
        .select('id')
        .eq('codigo', codigo)
        .single();

      if (!form) {
        console.error(`[FORM] No se encontró formulario con codigo=${codigo}`);
        return;
      }
      setFormularioId(form.id);

      // Cargar respuesta existente para esta asignación
      const { data: resp } = await supabase
        .from('respuestas')
        .select('*')
        .eq('asignacion_id', asignacionId)
        .maybeSingle();

      if (resp) {
        setRespuestas(resp);
        setEstado(resp.estado || 'en_progreso');
      }
    };
    cargar();
  }, [codigo, asignacionId]);

  // 2. guardarRespuestas usa el formulario_id y asignacion_id correctos
  const guardarRespuestas = async (nuevasRespuestas) => {
    const payload = {
      ...nuevasRespuestas,
      user_id: (await supabase.auth.getUser()).data.user.id,
      formulario_id: formularioId,
      asignacion_id: asignacionId,
      estado,
      updated_at: new Date().toISOString(),
    };

    // UPSERT por asignacion_id (única por coachee+formulario)
    const { error } = await supabase
      .from('respuestas')
      .upsert(payload, { onConflict: 'asignacion_id' });

    if (error) {
      console.error('[FORM] Error guardando respuestas:', error);
      throw error;
    }
  };

  // 3. Progreso calculado usando los fieldNames de la config
  const calcularProgreso = () => {
    const total = fieldNames.length;
    const completados = fieldNames.filter((f) => {
      const val = respuestas[f];
      return val !== undefined && val !== null && val !== '';
    }).length;
    return Math.round((completados / total) * 100);
  };

  // 4. Finalizar: marca estado='finalizado' en respuestas Y en asignacion
  const finalizar = async () => {
    const userId = (await supabase.auth.getUser()).data.user.id;
    const now = new Date().toISOString();

    await supabase.from('respuestas').update({
      estado: 'finalizado',
      finalizado_at: now,
      finalizado_por: userId,
    }).eq('asignacion_id', asignacionId);

    await supabase.from('asignaciones').update({
      estado: 'finalizado',
      finalizado_at: now,
      finalizado_por: userId,
    }).eq('id', asignacionId);

    setEstado('finalizado');
  };

  // 5. Solicitar reapertura
  const solicitarReapertura = async (nota) => {
    await supabase.from('asignaciones').update({
      solicitud_reapertura_pendiente: true,
      solicitud_reapertura_nota: nota || null,
    }).eq('id', asignacionId);
  };

  return (
    <FormContext.Provider value={{
      config,
      secciones: config.secciones,
      respuestas,
      setRespuestas,
      estado,
      progreso: calcularProgreso(),
      guardarRespuestas,
      finalizar,
      solicitarReapertura,
    }}>
      {children}
    </FormContext.Provider>
  );
};

export const useForm = () => useContext(FormContext);
```

### 2.2 — Reglas para Antigravity

- **Mostrá el archivo `FormContext.jsx` completo después de los cambios.** No solo diffs.
- Conservá toda la lógica de validaciones, formateo, autosave, etc. que ya exista. Solo cambiamos lo necesario para soportar N formularios.
- Si hay lógica específica de "Yo Real-Actual" en `FormContext` (ej: validaciones de un campo puntual de esa sección), moverla a la config del formulario o a la sección, no dejarla en el context.
- Logs con prefijo `[FORM]`.

**Checkpoint 3:** Mostrá el `FormContext.jsx` refactorizado completo. José revisa antes de seguir.

---

## PASO 3 — Refactorizar FormularioPage

El `FormularioPage` hoy recibe `:codigo` de la URL (eso ya quedó de Fase 1.B). Ahora tiene que:

1. Leer el `:codigo` de la URL
2. Buscar la asignación correspondiente del coachee logueado para ese código
3. Validar que la asignación exista y esté habilitada (esto ya estaba en Fase 1.B, conservar)
4. Pasar `codigo` y `asignacionId` al `FormProvider`
5. Renderizar las secciones desde `config.secciones` (no más switch hardcoded)

Estructura objetivo:

```jsx
// src/pages/FormularioPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useAsignaciones } from '../hooks/useAsignaciones';
import { FormProvider, useForm } from '../context/FormContext';

const FormularioContent = () => {
  const { secciones, progreso, estado } = useForm();
  // ... barra de progreso sticky, botones, modal de finalizar, etc.
  return (
    <>
      {/* Header / barra de progreso */}
      {secciones.map((s) => {
        const Componente = s.componente;
        return (
          <section key={s.id}>
            <h2>{s.titulo}</h2>
            <Componente />
          </section>
        );
      })}
      {/* Footer con botones */}
    </>
  );
};

const FormularioPage = () => {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const { asignaciones, loading } = useAsignaciones();

  if (loading) return <Cargando />;

  const asignacion = asignaciones.find((a) => a.formulario.codigo === codigo);

  if (!asignacion) {
    return <ErrorView mensaje="No tenés acceso a este formulario." />;
  }

  if (!asignacion.habilitado) {
    return <ErrorView mensaje="Este formulario todavía no está disponible." />;
  }

  return (
    <FormProvider codigo={codigo} asignacionId={asignacion.id}>
      <FormularioContent />
    </FormProvider>
  );
};

export default FormularioPage;
```

**Reglas:**
- Conservar el botón "Volver al Hub" que ya existe.
- Conservar toda la UI de barra sticky, modal de finalizar, botón de reapertura.
- El switch/array de secciones hardcoded que había antes ahora se reemplaza por `secciones.map(...)` leyendo de la config.

**Checkpoint 4:** Mostrá `FormularioPage.jsx` completo. José revisa.

---

## PASO 4 — Validar que las secciones sigan funcionando

Las secciones (Seccion1, Seccion2, ..., Seccion7) hoy probablemente usan `useForm()` para leer/escribir respuestas. Eso no cambia. **No deberían necesitar modificación.**

Verificá rápidamente:
- Que cada componente de sección importe `useForm` desde el mismo path
- Que las llamadas a `setRespuestas` o `guardarRespuestas` sigan funcionando igual
- Si alguna sección importa el array hardcoded de `fieldNames` directamente del `FormContext`, refactorizarla para que use lo que viene del context (que ahora viene de la config)

**Reportá en el chat:** ¿alguna sección necesitó modificación? ¿Cuál y por qué?

---

## PASO 5 — Build y test local

```bash
npm run build
```

Si el build falla, reportá el error completo y NO continúes.

Si el build pasa, levantá local:

```bash
npm run dev
```

### Test funcional manual (José lo hace, NO Antigravity):

1. Login con `josereyplay4@gmail.com`
2. Llega al Hub → ve la card de "Yo Real-Actual"
3. Click en la card → entra al formulario
4. Verifica:
   - Las 7 secciones aparecen igual que antes
   - Las respuestas previamente guardadas se cargan correctamente
   - La barra de progreso muestra el % correcto
   - Editar un campo y autosave funciona (revisar Network: el upsert debe incluir `formulario_id` y `asignacion_id`)
   - Botón "Volver al Hub" funciona
5. Login con un coachee finalizado (`rey.jose2@usal.edu.ar` o similar) → ver modo lectura intacto
6. En Supabase, verificar que las nuevas filas en `respuestas` tengan `formulario_id` y `asignacion_id` llenos

---

## PASO 6 — Checklist final

Antes de cerrar la fase, Antigravity reporta:

- [ ] Carpeta `src/formularios/configs/` creada
- [ ] Archivo `yo_real_actual.js` creado con secciones + fieldNames
- [ ] Archivo `index.js` de configs creado
- [ ] `FormContext.jsx` refactorizado (recibe codigo + asignacionId, carga config dinámica)
- [ ] `FormularioPage.jsx` refactorizado (renderiza secciones desde config)
- [ ] Build pasa sin errores ni warnings nuevos
- [ ] Logs con prefijo `[FORM]` aplicados donde corresponde
- [ ] Antigravity NO hizo commit ni push

Y muestra:
- Lista de archivos creados
- Lista de archivos modificados
- Cualquier decisión que tomó por su cuenta y por qué

---

## CRITERIO DE ÉXITO

Esta fase está completa cuando:

1. El usuario no nota ningún cambio visible (todo sigue funcionando igual)
2. En la base de datos, los nuevos guardados de `respuestas` incluyen `formulario_id` y `asignacion_id` correctamente
3. Agregar un formulario nuevo en Fase 2 requerirá SOLO:
   - Crear los componentes de sus secciones
   - Crear su archivo de config (ej: `bienvenida.js`)
   - Sumarlo al `index.js` de configs
   - **NO tocar FormContext ni FormularioPage**

---

## NOTAS PARA EL CHAT (post-ejecución)

Cuando termines, reportá en este formato:

```
PASO 0 (inspección): OK / NOTAS
PASO 1.1 (carpeta configs): OK
PASO 1.2 (yo_real_actual.js): OK / archivo mostrado en checkpoint 2
PASO 1.3 (index.js): OK
PASO 2 (FormContext refactor): OK / archivo mostrado en checkpoint 3
PASO 3 (FormularioPage refactor): OK / archivo mostrado en checkpoint 4
PASO 4 (secciones): SIN CAMBIOS / [si hubo cambios, listar]
PASO 5 (build): OK / ERROR [pegar error si hubo]
PASO 6 (checklist): TODOS LOS ITEMS OK / FALTAN [listar]

DECISIONES TOMADAS POR ANTIGRAVITY:
- [decisión 1]
- [decisión 2]

PREGUNTAS PENDIENTES:
- [pregunta si la hay]
```

---

## SIGUIENTE FASE

Cuando José confirme que Fase 1.C está bien testeada y pusheada:
**Fase 1.D — Panel del coach refactoreado** (pestañas, asignación de formularios, aprobar reaperturas).
