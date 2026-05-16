# FASE 1.A — Modelo de datos nuevo + Migración de datos existentes

**Proyecto:** Sistema Multi-Formulario CONSCIENCIA
**Documento de arquitectura:** `ARQUITECTURA_multi_formulario.md` (raíz del proyecto)
**Ejecutor:** José Rey (manual en Supabase Dashboard)
**Antigravity:** Solo verifica al final, NO toca código

---

## ⚠️ ANTES DE EJECUTAR

**1. Backup obligatorio:** vamos a tocar la tabla `respuestas` que tiene datos reales. Si algo sale mal, necesitás poder volver atrás.

En Supabase Dashboard → SQL Editor → ejecutar:

```sql
-- Backup de seguridad antes de migrar
CREATE TABLE respuestas_backup_pre_multiform AS 
SELECT * FROM public.respuestas;

-- Verificar que se copió todo
SELECT COUNT(*) FROM respuestas_backup_pre_multiform;
SELECT COUNT(*) FROM respuestas;
-- Los dos números deben ser iguales
```

**2. Confirmá conteos antes de seguir:**

```sql
SELECT COUNT(*) FROM respuestas;
SELECT COUNT(*) FROM coaches;
SELECT COUNT(*) FROM auth.users WHERE email != 'contacto@conscienciahumana.com';
```

Anotá los 3 números. Al final de la migración tienen que coincidir.

---

## PASO 1 — Agregar campo `rol` a tabla `coaches`

```sql
-- Agregar columna rol
ALTER TABLE public.coaches 
ADD COLUMN rol text DEFAULT 'coach' 
  CHECK (rol IN ('super_admin', 'coach'));

-- José Rey queda como super_admin
UPDATE public.coaches 
SET rol = 'super_admin' 
WHERE email = 'contacto@conscienciahumana.com';

-- Verificar
SELECT email, nombre, apellido, rol FROM public.coaches;
```

Esperado: ver tu fila con `rol = 'super_admin'`.

---

## PASO 2 — Crear tabla `coachees`

```sql
CREATE TABLE public.coachees (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id uuid NOT NULL REFERENCES public.coaches(id),
  nombre text,
  apellido text,
  flujo_tipo text DEFAULT 'libre' 
    CHECK (flujo_tipo IN ('libre', 'secuencial')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_coachees_coach_id ON public.coachees(coach_id);
```

---

## PASO 3 — Crear tabla `formularios`

```sql
CREATE TABLE public.formularios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  titulo text NOT NULL,
  descripcion text,
  autor_coach_id uuid REFERENCES public.coaches(id),
  es_sistema boolean DEFAULT false,
  orden_sugerido int DEFAULT 0,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_formularios_codigo ON public.formularios(codigo);
CREATE INDEX idx_formularios_autor ON public.formularios(autor_coach_id);
```

---

## PASO 4 — Insertar formularios iniciales en el catálogo

```sql
-- Formulario "Yo Real-Actual" (el que ya existe en producción)
INSERT INTO public.formularios (codigo, titulo, descripcion, es_sistema, orden_sugerido)
VALUES (
  'yo_real_actual',
  'Yo Real-Actual',
  'Diagnóstico profundo de tu situación actual. Primera etapa del proceso de transformación.',
  true,
  2
);

-- Placeholder para el formulario de Bienvenida (se construye en Fase 2)
INSERT INTO public.formularios (codigo, titulo, descripcion, es_sistema, orden_sugerido, activo)
VALUES (
  'bienvenida',
  'Bienvenida',
  'Primer paso del proceso: contanos quién sos y qué buscás.',
  true,
  1,
  false  -- inactivo hasta que se desarrolle en Fase 2
);

-- Verificar
SELECT codigo, titulo, es_sistema, activo, orden_sugerido FROM public.formularios;
```

Esperado: 2 filas, "bienvenida" y "yo_real_actual".

---

## PASO 5 — Crear tabla `asignaciones`

```sql
CREATE TABLE public.asignaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coachee_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  formulario_id uuid NOT NULL REFERENCES public.formularios(id) ON DELETE CASCADE,
  habilitado boolean DEFAULT false,
  estado text DEFAULT 'no_iniciado'
    CHECK (estado IN ('no_iniciado', 'en_progreso', 'finalizado')),
  finalizado_at timestamptz,
  finalizado_por uuid REFERENCES auth.users(id),
  activado_por uuid REFERENCES public.coaches(id),
  activado_at timestamptz,
  solicitud_reapertura_pendiente boolean DEFAULT false,
  solicitud_reapertura_nota text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(coachee_user_id, formulario_id)
);

CREATE INDEX idx_asignaciones_coachee ON public.asignaciones(coachee_user_id);
CREATE INDEX idx_asignaciones_formulario ON public.asignaciones(formulario_id);
CREATE INDEX idx_asignaciones_estado ON public.asignaciones(estado);
```

---

## PASO 6 — Extender tabla `respuestas` con FK

```sql
ALTER TABLE public.respuestas 
ADD COLUMN formulario_id uuid REFERENCES public.formularios(id),
ADD COLUMN asignacion_id uuid REFERENCES public.asignaciones(id);

CREATE INDEX idx_respuestas_formulario ON public.respuestas(formulario_id);
CREATE INDEX idx_respuestas_asignacion ON public.respuestas(asignacion_id);
```

---

## PASO 7 — MIGRACIÓN DE DATOS EXISTENTES ⚠️

Este es el paso crítico. Vamos a migrar el registro de `josereyplay4` (y cualquier otro coachee que exista) a la nueva estructura.

### 7.1 — Crear coachees a partir de respuestas existentes

```sql
-- Insertar en coachees todos los users que tienen respuestas
-- Los asignamos al super_admin (José) como coach por defecto
INSERT INTO public.coachees (user_id, coach_id, nombre, apellido, flujo_tipo)
SELECT DISTINCT
  r.user_id,
  (SELECT id FROM public.coaches WHERE rol = 'super_admin' LIMIT 1) as coach_id,
  r.coachee_nombre,
  r.coachee_apellido,
  'libre' as flujo_tipo  -- coachees existentes no tienen flujo secuencial obligatorio
FROM public.respuestas r
WHERE r.user_id IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- Verificar
SELECT c.user_id, c.nombre, c.apellido, c.flujo_tipo, coach.email as coach_email
FROM public.coachees c
JOIN public.coaches coach ON coach.id = c.coach_id;
```

Esperado: una fila por cada coachee existente (probablemente 1: josereyplay4).

### 7.2 — Crear asignaciones del formulario "Yo Real-Actual" para coachees existentes

```sql
-- Cada coachee existente recibe una asignación de "Yo Real-Actual" 
-- con estado que matchee su estado actual de respuestas
INSERT INTO public.asignaciones (
  coachee_user_id, 
  formulario_id, 
  habilitado, 
  estado, 
  finalizado_at, 
  finalizado_por,
  activado_por,
  activado_at
)
SELECT 
  r.user_id,
  (SELECT id FROM public.formularios WHERE codigo = 'yo_real_actual'),
  true as habilitado,  -- ya estaba accesible
  COALESCE(r.estado, 'en_progreso') as estado,  -- usa el estado actual
  r.finalizado_at,
  r.finalizado_por,
  (SELECT id FROM public.coaches WHERE rol = 'super_admin' LIMIT 1) as activado_por,
  r.created_at as activado_at
FROM public.respuestas r
WHERE r.user_id IS NOT NULL
ON CONFLICT (coachee_user_id, formulario_id) DO NOTHING;

-- Verificar
SELECT 
  a.id, 
  c.email as coachee_email, 
  f.titulo as formulario, 
  a.estado, 
  a.habilitado
FROM public.asignaciones a
JOIN auth.users c ON c.id = a.coachee_user_id
JOIN public.formularios f ON f.id = a.formulario_id;
```

Esperado: una asignación por coachee existente, con su estado real (en_progreso o finalizado).

### 7.3 — Vincular respuestas existentes con la nueva asignación

```sql
-- Actualizar cada fila de respuestas con su formulario_id y asignacion_id
UPDATE public.respuestas r
SET 
  formulario_id = (SELECT id FROM public.formularios WHERE codigo = 'yo_real_actual'),
  asignacion_id = (
    SELECT a.id 
    FROM public.asignaciones a 
    WHERE a.coachee_user_id = r.user_id 
    AND a.formulario_id = (SELECT id FROM public.formularios WHERE codigo = 'yo_real_actual')
  )
WHERE r.user_id IS NOT NULL
  AND r.formulario_id IS NULL;

-- Verificar que todas las respuestas tengan FK
SELECT 
  COUNT(*) as total_respuestas,
  COUNT(formulario_id) as con_formulario,
  COUNT(asignacion_id) as con_asignacion
FROM public.respuestas;
-- Los 3 números deben ser iguales
```

---

## PASO 8 — Políticas RLS de las tablas nuevas

```sql
-- ====== COACHEES ======
ALTER TABLE public.coachees ENABLE ROW LEVEL SECURITY;

-- Coachee ve su propio perfil
CREATE POLICY "Coachees: ven su propio perfil"
  ON public.coachees FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Coach ve los coachees que tiene asignados
CREATE POLICY "Coaches: ven sus coachees"
  ON public.coachees FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.coaches
      WHERE coaches.user_id = auth.uid()
      AND (coaches.id = coachees.coach_id OR coaches.rol = 'super_admin')
      AND coaches.activo = true
    )
  );

-- ====== FORMULARIOS ======
ALTER TABLE public.formularios ENABLE ROW LEVEL SECURITY;

-- Cualquier autenticado puede leer el catálogo de formularios
CREATE POLICY "Formularios: lectura pública para autenticados"
  ON public.formularios FOR SELECT TO authenticated
  USING (true);

-- ====== ASIGNACIONES ======
ALTER TABLE public.asignaciones ENABLE ROW LEVEL SECURITY;

-- Coachee ve sus propias asignaciones
CREATE POLICY "Coachees: ven sus asignaciones"
  ON public.asignaciones FOR SELECT TO authenticated
  USING (auth.uid() = coachee_user_id);

-- Coach ve asignaciones de sus coachees
CREATE POLICY "Coaches: ven asignaciones de sus coachees"
  ON public.asignaciones FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.coaches c
      JOIN public.coachees ce ON ce.coach_id = c.id
      WHERE c.user_id = auth.uid()
      AND ce.user_id = asignaciones.coachee_user_id
      AND c.activo = true
    )
    OR
    EXISTS (
      SELECT 1 FROM public.coaches
      WHERE coaches.user_id = auth.uid()
      AND coaches.rol = 'super_admin'
      AND coaches.activo = true
    )
  );

-- Coach actualiza asignaciones de sus coachees (habilitar/deshabilitar)
CREATE POLICY "Coaches: update asignaciones de sus coachees"
  ON public.asignaciones FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.coaches c
      JOIN public.coachees ce ON ce.coach_id = c.id
      WHERE c.user_id = auth.uid()
      AND ce.user_id = asignaciones.coachee_user_id
      AND c.activo = true
    )
    OR
    EXISTS (
      SELECT 1 FROM public.coaches
      WHERE coaches.user_id = auth.uid()
      AND coaches.rol = 'super_admin'
      AND coaches.activo = true
    )
  );

-- Coachee actualiza el estado de su propia asignación (para finalizar, solicitar reapertura)
CREATE POLICY "Coachees: update su propia asignacion"
  ON public.asignaciones FOR UPDATE TO authenticated
  USING (auth.uid() = coachee_user_id)
  WITH CHECK (auth.uid() = coachee_user_id);
```

---

## PASO 9 — Verificación final

Ejecutar todo este bloque para confirmar que la migración salió bien:

```sql
-- Verificación 1: estructura
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('coaches', 'coachees', 'formularios', 'asignaciones', 'respuestas', 'respuestas_backup_pre_multiform')
ORDER BY table_name;
-- Deben aparecer las 6 tablas

-- Verificación 2: coaches con rol
SELECT email, rol, activo FROM public.coaches;
-- Tu fila con rol = 'super_admin'

-- Verificación 3: formularios cargados
SELECT codigo, titulo, es_sistema, activo FROM public.formularios ORDER BY orden_sugerido;
-- 2 filas: bienvenida (inactivo) y yo_real_actual (activo)

-- Verificación 4: coachees migrados
SELECT 
  c.user_id, c.nombre, c.apellido, c.flujo_tipo,
  coach.email as coach_asignado
FROM public.coachees c
JOIN public.coaches coach ON coach.id = c.coach_id;
-- Al menos 1 fila (josereyplay4 asignado a vos)

-- Verificación 5: asignaciones creadas
SELECT 
  a.id, u.email as coachee, f.codigo as formulario, 
  a.habilitado, a.estado, a.finalizado_at
FROM public.asignaciones a
JOIN auth.users u ON u.id = a.coachee_user_id
JOIN public.formularios f ON f.id = a.formulario_id;
-- Una asignación por coachee migrado

-- Verificación 6: respuestas vinculadas
SELECT 
  COUNT(*) as total,
  COUNT(formulario_id) as con_formulario_id,
  COUNT(asignacion_id) as con_asignacion_id
FROM public.respuestas;
-- Los 3 números deben ser iguales

-- Verificación 7: integridad referencial
SELECT 
  r.email,
  r.estado as estado_respuestas,
  a.estado as estado_asignacion,
  CASE WHEN r.estado = a.estado THEN '✅ Consistente' ELSE '❌ Inconsistente' END as check
FROM public.respuestas r
JOIN public.asignaciones a ON a.id = r.asignacion_id;
-- Todos deben decir Consistente
```

---

## ✅ Checklist final

Antes de avanzar a Fase 1.B, confirmar que TODO esto pasó:

- [ ] Backup creado y conteos confirmados
- [ ] Campo `rol` agregado, José como super_admin
- [ ] Tabla `coachees` creada
- [ ] Tabla `formularios` creada con 2 entradas (bienvenida + yo_real_actual)
- [ ] Tabla `asignaciones` creada
- [ ] Tabla `respuestas` extendida con FKs
- [ ] Coachees existentes migrados
- [ ] Asignaciones creadas para coachees existentes
- [ ] Respuestas vinculadas a sus asignaciones (FKs llenas)
- [ ] Políticas RLS aplicadas
- [ ] Verificaciones 1-7 todas OK

---

## Si algo falla — Rollback

Si en cualquier momento algo sale mal y querés volver al estado inicial:

```sql
-- Restaurar respuestas desde backup
DROP TABLE public.respuestas;
ALTER TABLE public.respuestas_backup_pre_multiform RENAME TO respuestas;

-- Eliminar tablas nuevas
DROP TABLE IF EXISTS public.asignaciones;
DROP TABLE IF EXISTS public.coachees;
DROP TABLE IF EXISTS public.formularios;

-- Sacar columna rol de coaches
ALTER TABLE public.coaches DROP COLUMN IF EXISTS rol;
```

⚠️ **NO ejecutar el rollback a menos que algo realmente haya fallado.**

---

## Después de la verificación

Reportar al chat:

```
Backup: HECHO / NO
Paso 1 (rol coaches): OK / FALLA
Paso 2 (tabla coachees): OK / FALLA
Paso 3 (tabla formularios): OK / FALLA
Paso 4 (formularios cargados): OK / FALLA
Paso 5 (tabla asignaciones): OK / FALLA
Paso 6 (respuestas con FK): OK / FALLA
Paso 7.1 (migrar coachees): OK / FALLA
Paso 7.2 (crear asignaciones): OK / FALLA
Paso 7.3 (vincular respuestas): OK / FALLA
Paso 8 (RLS): OK / FALLA
Paso 9 (verificación final): TODAS OK / ALGUNA FALLA
```

Con todos los OK, **el sistema sigue funcionando exactamente igual** desde el frontend (no rompimos nada visible) pero la base ya está lista para soportar multi-formulario.

Próximo paso será **Fase 1.B (hub del coachee)** en sesión nueva.
