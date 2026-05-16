# ARQUITECTURA — Sistema Multi-Formulario CONSCIENCIA

**Versión:** 1.0
**Fecha:** Mayo 2026
**Autor del proceso:** José Rey (SuperAdmin) + Claude (arquitectura)
**Estado:** Diseño aprobado, pendiente de implementación

---

## 1. RESUMEN EJECUTIVO

La plataforma CONSCIENCIA evoluciona de un sistema mono-formulario (un solo cuestionario "Yo Real-Actual") a una plataforma multi-formulario con jerarquía de roles, propiedad por coach y flujo personalizado por coachee.

**Cambio conceptual:**
```
HOY:    1 Coachee → 1 Formulario
FUTURO: 1 Coachee → N Formularios (asignados por su coach)
```

---

## 2. ROLES Y JERARQUÍA

El sistema tiene 3 roles:

```
SuperAdmin (José Rey - CONSCIENCIA)
    │ Acceso total. Crea coaches. Activa/desactiva cualquier formulario para
    │ cualquier coachee. Tiene vista global de la plataforma.
    │
    └── Coach (Mauricio, Leandro, otros)
            │ Crea sus formularios (con código, ver punto 5). Tiene SUS coachees
            │ asignados. Activa/desactiva formularios (propios y del sistema) para
            │ sus coachees.
            │
            └── Coachee (usuario final)
                    Ve sus formularios asignados. Los habilitados son interactuables,
                    los bloqueados aparecen en gris con candado. Puede solicitar
                    reapertura de formularios finalizados.
```

### Implementación

- Tabla `coaches` extendida con campo `rol` (`super_admin` | `coach`).
- José Rey queda como `super_admin`. Coaches nuevos por default `coach`.
- Cada formulario tiene un campo `autor_coach_id` que lo vincula a su creador.
- Tag visual del autor en la card del formulario que ve el coachee.

---

## 3. MODELO DE DATOS

### 3.1 — Tablas nuevas

```sql
-- Catálogo de formularios disponibles en la plataforma
CREATE TABLE formularios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,           -- ej: 'bienvenida', 'yo_real_actual'
  titulo text NOT NULL,                  -- ej: 'Formulario de Bienvenida'
  descripcion text,                      -- ej: 'Primer paso del proceso de coaching'
  autor_coach_id uuid REFERENCES coaches(id),  -- NULL si es del sistema
  es_sistema boolean DEFAULT false,      -- TRUE para Bienvenida, Yo Real, etc.
  orden_sugerido int DEFAULT 0,          -- para ordenar en el hub del coachee
  activo boolean DEFAULT true,           -- soft-delete del formulario en sí
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Asignación de formularios a coachees
CREATE TABLE asignaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coachee_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  formulario_id uuid NOT NULL REFERENCES formularios(id) ON DELETE CASCADE,
  habilitado boolean DEFAULT false,      -- gris con candado vs interactuable
  estado text DEFAULT 'no_iniciado'      -- 'no_iniciado' | 'en_progreso' | 'finalizado'
    CHECK (estado IN ('no_iniciado', 'en_progreso', 'finalizado')),
  finalizado_at timestamptz,
  finalizado_por uuid REFERENCES auth.users(id),
  activado_por uuid REFERENCES coaches(id),    -- auditoría: quién habilitó
  activado_at timestamptz,
  solicitud_reapertura_pendiente boolean DEFAULT false,
  solicitud_reapertura_nota text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(coachee_user_id, formulario_id)
);

-- Perfiles de coachee (relación coach-coachee + config)
CREATE TABLE coachees (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id uuid NOT NULL REFERENCES coaches(id),  -- 1 coach por coachee (hoy)
  nombre text,
  apellido text,
  flujo_tipo text DEFAULT 'libre'                  -- 'libre' | 'secuencial'
    CHECK (flujo_tipo IN ('libre', 'secuencial')),
  created_at timestamptz DEFAULT now()
);
```

### 3.2 — Tablas existentes modificadas

```sql
-- Tabla coaches: agregar campo rol
ALTER TABLE coaches ADD COLUMN rol text DEFAULT 'coach'
  CHECK (rol IN ('super_admin', 'coach'));
-- José Rey: UPDATE coaches SET rol = 'super_admin' WHERE email = 'contacto@conscienciahumana.com';

-- Tabla respuestas: refactor para soportar N formularios por coachee
ALTER TABLE respuestas ADD COLUMN formulario_id uuid REFERENCES formularios(id);
ALTER TABLE respuestas ADD COLUMN asignacion_id uuid REFERENCES asignaciones(id);
```

### 3.3 — Migración de datos existentes

Es crítico. El registro de `josereyplay4@gmail.com` y cualquier otro coachee actual debe migrar a la nueva estructura **sin perder respuestas**.

**Plan de migración:**

1. Insertar el formulario "Yo Real-Actual" en la nueva tabla `formularios` (es_sistema=true, autor_coach_id=null)
2. Para cada fila existente en `respuestas`:
   - Si no existe coachee → crear en tabla `coachees` con `flujo_tipo='libre'` (compatibilidad)
   - Crear asignación en `asignaciones` con `habilitado=true`, `estado=` lo que tenga hoy
   - Actualizar la fila de `respuestas` con `formulario_id` apuntando al "Yo Real-Actual"

### 3.4 — RLS (Row Level Security)

Políticas clave a implementar:

- **Coachee:** ve solo sus propias asignaciones y respuestas
- **Coach:** ve solo asignaciones y respuestas de sus coachees
- **SuperAdmin:** ve todo
- **Coach:** puede insertar asignaciones solo para sus coachees
- **SuperAdmin:** puede insertar asignaciones para cualquier coachee

---

## 4. INTERFACES Y FLUJOS

### 4.1 — Hub del Coachee (`/`)

**Vista nueva post-login del coachee.** Reemplaza el redirect actual a `/` que va directo al formulario.

**Componente:** `HubCoachee.jsx`

**Layout:** Cards en grilla (2-3 columnas, responsive).

**Cada card contiene:**
- Título del formulario
- Descripción breve
- Tag visual del coach autor (color/nombre)
- Estado visual:
  - 🔒 Bloqueado (gris, no clickeable)
  - ✏️ En progreso (con porcentaje de avance)
  - ▶️ Disponible para empezar
  - ✅ Finalizado (con botón "Ver respuestas" y "Solicitar reapertura")

**Routing:**
- `/` → Hub del coachee
- `/formulario/:codigo` → Formulario específico (ej: `/formulario/yo_real_actual`)

### 4.2 — Panel del Coach (`/admin`)

**Refactor del AdminPage actual.**

Pestañas:
1. **Mis Coachees** — Lista de coachees asignados. Click en un coachee abre su detalle.
2. **Mis Formularios** — Lista de formularios que el coach creó (o ninguno si solo usa los del sistema).

**Detalle de un coachee** muestra:
- Datos personales
- Lista de asignaciones con su estado (no iniciado / en progreso / finalizado)
- Toggle por asignación: habilitar/deshabilitar
- Botón "+ Asignar formulario" para sumar más formularios
- Si hay solicitud de reapertura pendiente: banner amarillo con botones Aprobar/Rechazar
- Click en una asignación finalizada: ver respuestas (modal actual)

### 4.3 — Panel SuperAdmin (`/admin` para José)

**Vista global de control.**

Pestañas:
1. **Vista Global** — Tabla con TODOS los coachees del sistema, sus coaches, formularios y estados. Con filtros: por coach, por estado, por fecha de última actividad.
2. **Mis Coachees** — Igual que panel de coach.
3. **Coaches** — Lista de coaches del sistema. CRUD: alta de coach nuevo, dar de baja, ver sus coachees.
4. **Formularios** — Catálogo de formularios del sistema. CRUD básico.

### 4.4 — Onboarding automático

Cuando se crea un coachee nuevo (alta manual desde admin):
- Se inserta en tabla `coachees` con `coach_id` del coach que lo dio de alta
- Se generan asignaciones automáticas del "paquete básico":
  - Bienvenida (habilitado=true)
  - Yo Real-Actual (habilitado=false, esperando Bienvenida 100%)
- Se le envía email de bienvenida con credenciales (opcional, fase futura)

### 4.5 — Flujo "Solicitar reapertura"

1. Coachee finaliza un formulario → estado = 'finalizado'
2. Coachee ve botón "Solicitar reapertura" en la card → click abre modal con nota opcional
3. Sistema marca `solicitud_reapertura_pendiente=true` en la asignación
4. Coach (o SuperAdmin) recibe email notificación (vía Edge Function existente)
5. En el panel del coach aparece banner "Solicitud pendiente de [Coachee Nombre]"
6. Coach Aprueba → `estado` vuelve a `'en_progreso'`, `solicitud_pendiente=false`
7. Coach Rechaza → solo se limpia `solicitud_pendiente=false`, queda finalizado

---

## 5. CREACIÓN DE FORMULARIOS NUEVOS

**Por desarrollo, no por UI.** Por ahora cada formulario nuevo requiere:

1. Crear los componentes React de cada sección del formulario (similar a las secciones actuales de Yo Real-Actual)
2. Definir el schema en `respuestasSchema.js` (mapeo de keys → labels para el admin)
3. Definir los `fieldNames` en `FormContext.jsx` para el cálculo de progreso (o refactorearlo a configuración)
4. Registrar el formulario en la tabla `formularios` con su `codigo` y `autor_coach_id`
5. La ruta `/formulario/:codigo` carga el componente correspondiente

**Form Builder Visual queda para Fase 5+.** Cuando haya 5+ coaches con 3+ formularios cada uno, justifica el esfuerzo.

---

## 6. PLAN DE IMPLEMENTACIÓN POR FASES

### Fase 1.A — Modelo de datos + migración (1 sesión)
- SQL de tablas nuevas
- Migración del registro de `josereyplay4@gmail.com` y otros si los hay
- Políticas RLS

### Fase 1.B — Hub del coachee (1 sesión)
- Componente `HubCoachee.jsx`
- Routing `/` → hub, `/formulario/:codigo` → formulario
- Cards con estados visuales
- Botón "Solicitar reapertura"

### Fase 1.C — Refactor del formulario "Yo Real-Actual" (1 sesión)
- `FormularioPage.jsx` ahora recibe `:codigo` como prop
- `FormContext.jsx` refactoreado para soportar múltiples formularios (state separado por código)
- Adaptación del guardado para incluir `formulario_id` y `asignacion_id`

### Fase 1.D — Panel del coach refactoreado (1 sesión)
- Pestañas Mis Coachees / Mis Formularios
- Detalle de coachee con asignaciones y toggles
- Flujo de aprobar/rechazar reaperturas

### Fase 1.E — Panel SuperAdmin (1 sesión)
- Vista global con filtros
- CRUD de coaches
- Catálogo de formularios

### Fase 2 — Diseño del formulario de Bienvenida (1 sesión)
- Definir preguntas (José + Juan)
- Construir componentes
- Registrar en `formularios`

### Fase 3 — Migración a dominio propio `coaching.conscienciahumana.com`
- DNS + Vercel + Supabase

### Tareas menores aparte (cualquier momento)
- Ojo de "ver password" en LoginPage (15 min)
- Resend con dominio propio (ver doc previo)

---

## 7. DECISIONES TOMADAS Y JUSTIFICACIÓN

| Decisión | Elección | Por qué |
|---|---|---|
| Propiedad de formularios | Mixto: sistema + coach | Cada coach manda en lo suyo, hay troncales compartidos |
| Multi-coach | Arquitectura preparada, 1:1 hoy | Hoy es 1:1, pero el modelo soporta crecimiento sin refactor |
| Visibilidad de bloqueados | Todos visibles, bloqueados en gris | Da contexto al coachee del recorrido completo |
| Rol SuperAdmin | Campo `rol` en tabla `coaches` | Más escalable que tabla separada o hardcodeado |
| Activación cruzada | SuperAdmin puede activar todo | Vos sos el dueño, podés intervenir donde haga falta |
| Auditoría de activación | Campo `activado_por` + `activado_at` | Permite trazabilidad si hay conflictos |
| Flujo entre formularios | Mixto por coachee (`libre`/`secuencial`) | Coachees actuales no pueden tener flujo forzado, los nuevos sí |
| Visual del hub | Cards en grilla | Dashboard moderno, fácil de escanear |
| Finalizado + reapertura | Botón "Solicitar reapertura" con aprobación | Auto-gestión sin perder control del coach |
| Asignación por coach | Paquete básico automático + manual extra | Onboarding sin fricción, flexibilidad después |
| Form builder | No, desarrollo solamente por ahora | Hoy no se justifica, queda para Fase 5+ |
| Vista global SuperAdmin | Sí, con filtros | Imprescindible para gestionar con N coaches |

---

## 8. DECISIONES PENDIENTES (a definir durante implementación)

- **Diseño del formulario de Bienvenida:** preguntas concretas (Fase 2)
- **Sistema de notificación al coachee** cuando se le habilita un formulario nuevo (email? notificación in-app?)
- **Sistema de invitación de coachees:** ¿el coach genera un link de invitación o crea la cuenta directamente?
- **Branding multi-coach:** cuando Mauricio sume sus formularios, ¿la plataforma sigue siendo solo "CONSCIENCIA" o muestra co-branding?
- **Versiones de formularios:** si un coach edita las preguntas de un formulario que ya tiene respuestas guardadas, ¿qué pasa con esas respuestas?

---

## 9. RIESGOS IDENTIFICADOS

1. **Migración de datos en producción:** Hay 1 coachee con datos reales (`josereyplay4`). Si la migración falla, hay que tener rollback. Mitigación: hacer backup de la tabla `respuestas` antes de migrar.

2. **RLS complejas:** Las políticas con 3 roles + propiedad por coach son más complejas que las actuales. Testing extenso en local antes de producción.

3. **Refactor del FormContext:** Hoy el contexto maneja UN formulario. Soportar N formularios significa refactorear cómo se guarda el state local. Si se hace mal, se pueden mezclar respuestas entre formularios.

4. **Performance del hub:** Si un coachee tiene 8 formularios asignados, el hub hace 8 queries a `asignaciones`. Hay que asegurar que sea una sola query con JOIN.

---

## 10. CRITERIO DE ÉXITO

El sistema multi-formulario estará completo cuando:

- ✅ José puede crear un coachee nuevo y se le auto-asignan Bienvenida + Yo Real-Actual
- ✅ El coachee ve su hub con cards de los 2 formularios (uno disponible, otro bloqueado)
- ✅ Al completar Bienvenida al 100% y finalizar, el sistema desbloquea Yo Real-Actual
- ✅ José puede dar de alta a Mauricio como coach
- ✅ Mauricio entra al sistema, ve solo sus coachees (que José le asigna)
- ✅ Mauricio puede activar/desactivar formularios para sus coachees
- ✅ José tiene vista global de todo el sistema con filtros
- ✅ Un coachee finalizado puede solicitar reapertura → coach aprueba/rechaza
- ✅ Los datos de `josereyplay4` siguen accesibles y no se perdieron
