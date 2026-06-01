# ESTADO ACTUAL DEL PROYECTO — CONSCIENCIA

**Última actualización:** Mayo 2026
**Para uso de:** próximas instancias de Claude en este proyecto

---

## QUIÉN ES JOSÉ

José Rey es el dueño de CONSCIENCIA, una plataforma de coaching de transformación. Es el SuperAdmin del sistema. Trabaja con Antigravity como ejecutor de código y con Claude como arquitecto de soluciones.

**Estilo de trabajo de José:**
- Quiere precisión y eficiencia, no vueltas. Cada interacción cuesta tiempo y tokens.
- Detesta preguntas innecesarias que ya respondió o que se pueden inferir del contexto.
- Pide nivel profesional, no "a medias". Si una solución es la "barata", la rechaza.
- Aprueba decisiones con criterio. Cuando da un OK es porque entendió las implicancias.
- Trabaja en local primero, prueba, después pushea a producción.
- Es directo y a veces cortante cuando hay fricción. Es parte de su estilo, no es personal.

**Stack y herramientas:**
- React + Vite (frontend)
- Supabase (Auth + DB + Edge Functions + Storage)
- Resend (mails transaccionales)
- Vercel (hosting)
- Antigravity (asistente de código que ejecuta en su máquina local)
- Claude (arquitecto y revisor de prompts)

---

## DÓNDE ESTAMOS HOY

### Lo que ya está en producción

**URL actual:** `https://formulario-coaching.vercel.app`
**URL futura:** `https://coaching.conscienciahumana.com` (migración pendiente)

✅ **Auth profesional con Supabase Auth**
- Login, logout, registro
- Reset password con mail
- Tabla `coaches` con campo `rol` (super_admin / coach)
- José es super_admin

✅ **Sistema de notificaciones por email**
- Edge Function `send-form-notification` en Supabase
- Resend integrado (mail sale desde `onboarding@resend.dev`, dominio propio pendiente de verificación DNS)
- Cada submit del coachee dispara email al coach

✅ **Formulario "Yo Real-Actual" funcional**
- 7 secciones, ~48 campos
- Sistema de "Finalizar/Reabrir" con modo lectura
- Barra sticky de progreso
- Solicitud de reapertura con flujo de aprobación del coach

✅ **Panel del coach**
- Tabla de respuestas con badge de estado
- Modal de detalle con preguntas legibles (no snake_case)
- Botón Reabrir formulario finalizado
- Exportar CSV
- Eliminar registros

✅ **Modelo de datos multi-formulario (Fase 1.A completada)**
- Tablas nuevas: `coachees`, `formularios`, `asignaciones`
- Tabla `respuestas` extendida con FKs (`formulario_id`, `asignacion_id`)
- 5 coachees migrados, 5 asignaciones, 5 respuestas vinculadas
- RLS aplicado
- Backup de seguridad en `respuestas_backup_pre_multiform`

✅ **Fase 1.B — Hub del coachee**
- Componente nuevo `HubCoachee.jsx`
- Refactor de routing
- Refactor de `FormContext` para leer asignaciones

✅ **Fase 1.C — Refactor del formulario para usar el nuevo modelo**
- `FormularioPage.jsx` recibe `:codigo`
- `FormContext` maneja N formularios
- Configuración externa por formulario en `src/formularios/configs/`

✅ **Fase 1.D Mínima — Coherencia del admin**
- Fix del botón "Reabrir" (updatea asignaciones y respuestas)
- Listado con JOIN a asignaciones
- Badge de estado con fallbacks

✅ **Fase B — Frontend: Formulario "Seteo de Objetivos"**
- Creación de componentes genéricos (`SeccionGenerica`, `CampoTextarea`)
- Implementación de almacenamiento `jsonb` en Supabase para formularios nuevos
- Configuración declarativa con 13 secciones y 79 campos
- Refactor de `AdminPage.jsx` para soporte nativo de renderizado JSON y joins a `coachees` para fallback de campos vacíos.

### Lo que está en backlog

❌ **Fase 1.D Completa — Panel del coach refactoreado**
Pestañas Mis Coachees / Mis Formularios, asignación de formularios, aprobar reaperturas.

❌ **Fase 1.E — Panel SuperAdmin con vista global**
Vista de TODOS los coachees con filtros, CRUD de coaches.

❌ **Fase 2 — Formulario de Bienvenida**
Diseño + construcción del formulario placeholder que ya existe en la tabla `formularios` con activo=false.

❌ **Fase 3 — Migración a `coaching.conscienciahumana.com`**
DNS, Vercel domains, actualizar SITE_URL y Redirect URLs en Supabase.

❌ **Tareas menores**
- Ojo "ver password" en LoginPage (15 min)
- Resend con dominio propio (DNS + SPF/DKIM/DMARC)
- Lote cosmético: fix filtro "Este Mes" del admin, alert post-registro

---

## COACHEES ACTUALES EN EL SISTEMA

5 coachees migrados a la nueva estructura:

1. `josereyplay4@gmail.com` (Jose Test 001)
2. `rey.jose2@usal.edu.ar`
3. `ortizjuanmartin@gmail.com` (Juan Martin Ortiz)
4. `j@j.com`
5. `m@m.com`

Todos con `flujo_tipo='libre'` (sin obligación de orden secuencial), asignados al super_admin (José) como coach, con asignación al formulario "Yo Real-Actual" en estado `en_progreso`.

---

## DECISIONES DE ARQUITECTURA TOMADAS

(Si necesitás detalles, leer `ARQUITECTURA_multi_formulario.md`)

| Tema | Decisión |
|---|---|
| Roles | 3 niveles: SuperAdmin → Coach → Coachee |
| Propiedad de formularios | Mixto: sistema + del coach autor |
| Multi-coach por coachee | Arquitectura preparada, 1:1 hoy |
| Visibilidad de bloqueados | Todos visibles, bloqueados en gris con candado |
| Activación cruzada | SuperAdmin puede activar todo, con auditoría |
| Flujo entre formularios | Por coachee: `libre` o `secuencial` |
| Visual del hub | Cards en grilla con tag del coach autor |
| Reapertura | Coachee solicita, coach aprueba/rechaza |
| Asignación | Paquete básico automático + manual extra |
| Form builder visual | Por ahora desarrollo, builder en Fase 5+ |
| Vista global SuperAdmin | Sí, con filtros |

---

## REGLAS DE TRABAJO EN ESTE PROYECTO

**Para Claude:**
- Cuando dudes entre opciones, dar recomendación profesional explícita ("opción 2 porque...").
- No mezclar contextos: si una tarea pertenece a otra fase, mencionarlo y dejarla aparte.
- Generar archivos .md para Antigravity, no chat-to-chat de prompts largos.
- Cada .md de fase debe empezar con: "Antes de ejecutar nada, leé ARQUITECTURA_multi_formulario.md".
- Separar lo que ejecuta José (SQL en Supabase) de lo que ejecuta Antigravity (código en repo).
- NO commit ni push desde Antigravity. José testea local y pushea manualmente.

**Para Antigravity (a través de los .md):**
- Ejecutar fase por fase con checkpoints donde haga falta.
- Mostrar archivos completos cuando se modifican (no diffs parciales).
- `npm run build` después de cada cambio importante.
- Logs con prefijos: `[AUTH]`, `[FORM]`, `[ADMIN]`, `[MAIL]` según contexto.

---

## CÓMO RETOMAR DESDE ACÁ

Si arrancás una sesión nueva con José y él dice "retomamos":

1. **Pregúntale por qué fase quiere arrancar.** No asumas que es la siguiente en la lista.
2. **Si dice "Fase 1.B"** o "hub del coachee" → arrancar generando el .md correspondiente.
3. **Si dice "el ojo del password"** → tarea de 15 minutos, fix puntual en LoginPage.
4. **Si dice "migración del dominio"** → Fase 3.
5. **Si dice algo ambiguo** → pedir aclaración antes de generar nada.

**NUNCA empieces a generar código sin confirmar primero qué quiere hacer.** José pierde paciencia rápido con prompts que no responden a lo que pidió.

---

## CRÉDITOS DE ARQUITECTURA

Sistema diseñado en sesión colaborativa entre José Rey (decisiones de producto) y Claude (decisiones técnicas). Documentación completa en `ARQUITECTURA_multi_formulario.md`. Implementación por fases con Antigravity como ejecutor.
