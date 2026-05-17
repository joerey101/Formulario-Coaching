# FASE 1.D MÍNIMA — Coherencia del admin con el modelo multi-formulario

**Proyecto:** Sistema Multi-Formulario CONSCIENCIA
**Documento de arquitectura:** `ARQUITECTURA_multi_formulario.md` (raíz del proyecto)
**Estado previo:** Fase 1.A ✅, Fase 1.B ✅, Fase 1.C ✅ — todas en producción
**Ejecutor:** Antigravity
**Workflow:** Antigravity ejecuta y muestra archivos. José testea local y pushea manualmente. **NO commit ni push desde Antigravity.**

---

## ⚠️ ANTES DE EJECUTAR NADA

1. Leé `ARQUITECTURA_multi_formulario.md` para entender el modelo de roles (SuperAdmin → Coach → Coachee) y el modelo de datos (tablas `coachees`, `formularios`, `asignaciones`, `respuestas`).
2. Leé `ESTADO_ACTUAL_PROYECTO.md` para entender qué hay hecho hoy.
3. Confirmá que estás parado en la branch `react-migration`.
4. Confirmá que `npm run dev` levanta bien en local antes de tocar nada.

---

## CONTEXTO DE ESTA FASE

**Por qué existe esta fase mínima:** El lunes José recibe un cliente operativo real. Las respuestas de ese cliente forman parte de un proceso de coaching personal y NO pueden perderse. Antes de eso hay que dejar el panel del admin coherente con el nuevo modelo de datos (tablas `asignaciones` + `respuestas`).

**Bug detectado en producción** que motivó esta fase:
- José como admin clickea "Reabrir" sobre un formulario finalizado
- En el admin se ve correctamente como "reabierto"
- Pero cuando el coachee entra a su hub, el formulario **sigue cerrado** en modo readonly
- **Causa raíz:** el botón "Reabrir" del admin solo updatea la tabla `respuestas`, pero desde Fase 1.C el frontend lee el estado desde la tabla `asignaciones`. Las dos tablas quedan desincronizadas.

**Alcance MÍNIMO de esta fase (lo que SÍ hacemos):**
1. Fix crítico del botón "Reabrir" — debe updatear `asignaciones` también.
2. Auditar todo el AdminPage actual: cualquier query/mutación sobre la tabla `respuestas` que dependa del estado del formulario debe ahora ser coherente con `asignaciones`.
3. Verificar que el listado de coachees del admin lea correctamente desde el nuevo modelo (vía JOIN con `asignaciones`).
4. Asegurar que el flujo "Reabrir" del admin limpie `finalizado_at` y `finalizado_por` en ambas tablas.

**Alcance que NO entra en esta fase mínima** (queda para 1.D COMPLETA en sesión futura):
- Pestañas separadas "Mis Coachees" / "Mis Formularios"
- Toggle habilitar/deshabilitar formularios por asignación
- Botón "+ Asignar formulario" para sumar formularios manualmente
- Flujo de solicitud de reapertura del coachee (banner amarillo, aprobar/rechazar con nota)
- CRUD de coaches (eso va en Fase 1.E)

---

## PASO 0 — Inspección del AdminPage actual

Antes de tocar código, leé y reportá en el chat:

1. Contenido completo actual de:
   - `src/pages/AdminPage.jsx`
   - Cualquier hook custom que use el admin (probablemente `useRespuestas` o similar)
   - Cualquier helper o servicio que haga queries para el admin

2. Identificá y reportá:
   - **Query del listado:** ¿desde qué tabla(s) lee la lista principal de respuestas/coachees? ¿Hace JOIN con `asignaciones` o solo lee `respuestas`?
   - **Función "Reabrir":** ¿qué tabla(s) updatea? ¿Qué campos cambia? Pegá la función completa.
   - **Modal de "Ver respuestas":** ¿de dónde lee los datos?
   - **Función "Eliminar registro":** ¿qué tablas toca? (Importante: si solo borra de `respuestas` pero deja la `asignacion` huérfana, eso es un bug futuro.)
   - **Exportar CSV:** ¿qué columnas exporta? ¿de dónde lee?
   - **Badge de estado:** ¿lee `estado` desde `respuestas` o desde `asignaciones`?

3. Si encontrás algún `console.log`, prefijo de log, o comentario que indique que esta página fue diseñada antes del modelo multi-formulario, mencionalo.

**Checkpoint 1:** Reportá todo esto al chat antes de pasar al Paso 1. José revisa y confirma alcance puntual antes de seguir.

---

## PASO 1 — Fix de la función "Reabrir"

### 1.1 — Comportamiento esperado del botón "Reabrir"

Cuando el admin (o super_admin) clickea "Reabrir" sobre una asignación finalizada, **deben pasar las dos cosas a la vez**:

**Sobre la tabla `asignaciones` (fuente de verdad del estado):**
```javascript
{
  estado: 'en_progreso',
  finalizado_at: null,
  finalizado_por: null,
  solicitud_reapertura_pendiente: false,   // limpia cualquier solicitud pendiente
  solicitud_reapertura_nota: null,
  updated_at: new Date().toISOString(),
}
```

**Sobre la tabla `respuestas` (coherencia):**
```javascript
{
  estado: 'en_progreso',
  finalizado_at: null,
  finalizado_por: null,
  updated_at: new Date().toISOString(),
}
```

### 1.2 — Cómo encontrar la asignación correcta

El admin probablemente tiene en mano el `user_id` del coachee y/o el `id` de la fila de `respuestas`. Para updatear la asignación correcta, hay dos caminos válidos:

**Opción A (recomendada):** Si la fila de `respuestas` ya tiene `asignacion_id` lleno (lo está desde Fase 1.C):
```javascript
const asignacionId = respuesta.asignacion_id;
// update directo por id
await supabase.from('asignaciones').update({...}).eq('id', asignacionId);
```

**Opción B (fallback):** Si por alguna razón `asignacion_id` está vacío en la fila de respuestas (datos viejos):
```javascript
// buscar la asignación por user + codigo del formulario
const { data: asignacion } = await supabase
  .from('asignaciones')
  .select('id')
  .eq('coachee_user_id', userId)
  .eq('formulario_id', formularioId)
  .single();
```

**Usá la Opción A. Solo cae a la Opción B si Opción A devuelve null** (poco probable, pero defensivo).

### 1.3 — Manejo de errores

Si el update a `asignaciones` falla pero el update a `respuestas` ya pasó (o viceversa), las tablas quedan desincronizadas. Para evitar eso:

1. Updatear primero `asignaciones`. Si falla, abortar y NO tocar `respuestas`.
2. Si `asignaciones` ok, updatear `respuestas`. Si esta falla, logear el error pero el sistema sigue funcionando (la fuente de verdad es `asignaciones`).

Logs con prefijo `[ADMIN]`.

### 1.4 — UX

Después del reabrir exitoso, refrescar el listado (refetch) para que el badge de estado se actualice visualmente. Mostrar un alert/toast de confirmación: "Formulario reabierto. El coachee ya puede modificar sus respuestas."

**Checkpoint 2:** Mostrá la función "Reabrir" completa después del refactor. José revisa antes de seguir.

---

## PASO 2 — Coherencia del badge de estado

El listado del admin probablemente muestra un badge "En progreso" / "Finalizado" por cada fila. **Ese badge debe leer desde `asignaciones.estado`, no desde `respuestas.estado`.**

### 2.1 — Cambio en la query del listado

Si hoy la query es algo como:
```javascript
const { data } = await supabase.from('respuestas').select('*');
```

Refactorizar a un JOIN explícito:
```javascript
const { data } = await supabase
  .from('respuestas')
  .select(`
    *,
    asignaciones!inner (
      id,
      estado,
      habilitado,
      finalizado_at,
      finalizado_por,
      solicitud_reapertura_pendiente
    ),
    formularios!inner (
      codigo,
      titulo
    )
  `);
```

(Ajustar los nombres exactos de las FKs según cómo estén definidas en Supabase. Si el JOIN explícito no resuelve los nombres automáticamente, usar la sintaxis `asignaciones:asignacion_id(...)`.)

### 2.2 — Render del badge

El componente que renderiza el badge debe ahora leer `row.asignaciones.estado` (o como quede después del JOIN), no `row.estado` directo de respuestas.

### 2.3 — Filtros del admin

Si el admin tiene filtros tipo "Solo finalizados" / "Solo en progreso", deben aplicarse sobre `asignaciones.estado` también.

**Nota especial:** El filtro "Este Mes" del admin está roto (mencionado en el backlog). **NO lo arreglamos en esta fase mínima.** Si Antigravity ve fácilmente cómo arreglarlo de paso, lo deja anotado pero no lo toca. Es lote cosmético, va aparte.

**Checkpoint 3:** Mostrá la query refactoreada y el JSX que renderiza el badge. José revisa antes de pasar al Paso 3.

---

## PASO 3 — Coherencia del modal "Ver respuestas"

El modal actual probablemente muestra las respuestas en modo lectura. **Verificar que:**

1. El modal lee correctamente las respuestas desde `respuestas.respuestas` (jsonb).
2. Si muestra estado (En progreso/Finalizado), lee desde `asignaciones.estado`.
3. Si muestra fecha de finalización, lee desde `asignaciones.finalizado_at` (o de respuestas, son iguales si todo está coherente, pero la fuente de verdad es asignaciones).

Si todo ya está bien (porque el JSON de respuestas no cambió), no tocar nada. Solo confirmar y reportar.

---

## PASO 4 — Coherencia de "Eliminar registro"

Si el admin tiene botón "Eliminar registro", verificar el comportamiento esperado:

**Decisión:** eliminar un registro debe borrar:
1. La fila de `respuestas`
2. La fila de `asignaciones` correspondiente

NO debe borrar:
- El `auth.users` del coachee (sigue siendo usuario del sistema)
- La fila de `coachees` (puede tener otras asignaciones)

Implementación:
```javascript
// Primero borrar asignaciones (CASCADE borra respuestas automáticamente si la FK está bien)
await supabase.from('asignaciones').delete().eq('id', asignacionId);

// O si la CASCADE no está configurada:
// 1. Borrar respuestas primero
// 2. Borrar asignacion después
```

**Verificar primero si la CASCADE está configurada:** En el modelo de Fase 1.A definimos `ON DELETE CASCADE` en `asignacion_id` de respuestas. Si está, borrar la asignación es suficiente. Si no está, hacer las dos eliminaciones en orden.

Si el botón eliminar hoy solo borra de `respuestas`, refactorizarlo. **Mostrá la función completa después del cambio.**

---

## PASO 5 — Listado del admin: filtrar por rol

Hoy probablemente el admin lista TODAS las respuestas del sistema. Eso es OK porque José es super_admin. Pero conviene preparar el terreno para cuando se sumen otros coaches.

**Cambio chico:**

Si el coach logueado es `super_admin` → muestra TODAS las respuestas (comportamiento actual)
Si el coach logueado tiene rol `coach` normal → muestra SOLO las respuestas de sus coachees (los que tienen `coachees.coach_id = mi_id_de_coach`)

Esto es defensivo: hoy no hay otros coaches, pero la lógica queda lista. Las RLS ya hacen este filtrado a nivel base de datos (definido en Fase 1.A), pero conviene replicarlo en el query del frontend para que sea explícito y evite confusiones.

**Si el cambio es trivial (1-2 líneas), aplicarlo. Si requiere refactor grande del fetch, dejarlo anotado y NO tocar — eso va a la 1.D completa.**

---

## PASO 6 — Build y test local

```bash
npm run build
```

Si falla, reportar el error completo y NO continuar.

Si pasa, levantar local:
```bash
npm run dev
```

### Tests funcionales (José los hace, NO Antigravity):

**Test A — Reabrir funciona end-to-end:**
1. Como super_admin, entrar al panel
2. Identificar una fila con estado "Finalizado" (puede ser `josereyplay4` que finalizamos en Fase 1.C)
3. Click "Reabrir"
4. Verificar:
   - Aparece confirmación
   - El badge cambia a "En progreso" en el admin
   - En Supabase: la fila de `asignaciones` para ese coachee tiene `estado='en_progreso'`, `finalizado_at=null`, `finalizado_por=null`
   - En Supabase: la fila de `respuestas` para ese coachee tiene `estado='en_progreso'`, `finalizado_at=null`, `finalizado_por=null`
5. Cerrar sesión del admin, loguearse como ese coachee
6. Ir al hub: la card debe mostrar "En progreso" (no "Finalizado")
7. Click en la card: el formulario debe abrirse en modo editable (NO readonly)
8. Modificar un campo y guardar — debe persistir

**Test B — Badge y listado coherentes:**
1. Como admin, verificar que el badge de cada coachee refleje correctamente el estado de su asignación
2. Si hay coachees con estado mezclado, todos deben verse correctos

**Test C — Eliminar (opcional, solo si Antigravity tocó esta función):**
1. Crear un coachee descartable o usar `j@j.com` / `m@m.com`
2. Eliminar desde el admin
3. Verificar en Supabase: las filas en `respuestas` Y en `asignaciones` desaparecen
4. La fila en `coachees` y en `auth.users` queda (no borramos coachees ni users en esta fase)

---

## PASO 7 — Checklist final

Antes de cerrar la fase, Antigravity reporta:

- [ ] AdminPage inspeccionado y reportado (Paso 0)
- [ ] Función "Reabrir" updatea ambas tablas
- [ ] Listado del admin lee estado desde `asignaciones` (JOIN aplicado)
- [ ] Badge de estado coherente con `asignaciones.estado`
- [ ] Modal "Ver respuestas" verificado (modificado solo si hacía falta)
- [ ] "Eliminar registro" coherente (si se modificó)
- [ ] Listado filtra por rol del coach logueado (si era trivial)
- [ ] Build pasa sin errores ni warnings nuevos
- [ ] Logs con prefijo `[ADMIN]` aplicados
- [ ] Antigravity NO hizo commit ni push

Y muestra:
- Lista de archivos creados
- Lista de archivos modificados
- Cualquier decisión que tomó por su cuenta y por qué
- Si encontró bugs adicionales que NO entran en este alcance, dejarlos anotados (no arreglarlos)

---

## CRITERIO DE ÉXITO

Esta fase está completa cuando:

1. El admin puede reabrir un formulario finalizado y el coachee ve el cambio inmediato en su hub.
2. Las tablas `asignaciones` y `respuestas` quedan siempre coherentes después de cualquier acción del admin.
3. El listado del admin muestra correctamente quién está en qué estado.
4. No se rompe nada que ya funcione (modal de respuestas, exportar CSV, eliminar registro).
5. El lunes José puede recibir al cliente real con confianza: cualquier intervención del admin sobre las respuestas del coachee se reflejará correctamente, sin desincronizaciones que puedan confundirlo a él o al coachee.

---

## NOTAS PARA EL CHAT (post-ejecución)

Cuando termines, reportá en este formato:

```
PASO 0 (inspección): OK + reporte de funciones encontradas
PASO 1 (fix Reabrir): OK / archivo mostrado en checkpoint 2
PASO 2 (badge coherente): OK / archivo mostrado en checkpoint 3
PASO 3 (modal): SIN CAMBIOS / [si hubo cambios, listar]
PASO 4 (eliminar): SIN CAMBIOS / [si hubo cambios, listar]
PASO 5 (filtro por rol): APLICADO / DEJADO PARA 1.D COMPLETA (motivo)
PASO 6 (build): OK / ERROR [pegar error si hubo]
PASO 7 (checklist): TODOS LOS ITEMS OK / FALTAN [listar]

DECISIONES TOMADAS POR ANTIGRAVITY:
- [decisión 1]
- [decisión 2]

BUGS ADICIONALES ENCONTRADOS (no arreglados en esta fase):
- [si los hay]

PREGUNTAS PENDIENTES:
- [pregunta si la hay]
```

---

## SIGUIENTE FASE

Cuando José confirme que Fase 1.D mínima está testeada y pusheada:
- **Lunes:** José opera con cliente real con tranquilidad.
- **Otro día de la semana:** Fase 1.D COMPLETA (pestañas, asignaciones manuales, flujo de reapertura del coachee).
- **Después:** Fase 1.E (SuperAdmin con vista global + CRUD de coaches).
