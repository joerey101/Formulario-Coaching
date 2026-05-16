# ESTADO ACTUAL DEL PROYECTO — CONSCIENCIA

**Última actualización:** Mayo 2026 (post Fase 1.B completada y en producción)
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
- **A veces delega tareas en Antigravity que normalmente hace él (ej: testing con credenciales). Si lo menciona, asumir sin cuestionar.**

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
**Branch:** `react-migration`

✅ **Auth profesional con Supabase Auth**
- Login, logout, registro, reset password
- Tabla `coaches` con campo `rol` (super_admin / coach)
- Fix "Cargando..." al cambiar de pestaña (TOKEN_REFRESHED ya no parpadea)

✅ **Sistema de notificaciones por email**
- Edge Function `send-form-notification` en Supabase con Resend
- Mail sale desde `onboarding@resend.dev`, dominio propio pendiente de DNS

✅ **Formulario "Yo Real-Actual" funcional**
- 7 secciones, ~48 campos
- Sistema Finalizar/Reabrir con modo lectura + barra sticky de progreso
- Solicitud de reapertura con flujo de aprobación del coach
- Preguntas reformuladas según planilla de Juan, bloque del segundo hijo eliminado

✅ **Panel del coach**
- Tabla de respuestas con badge de estado, modal de detalle con preguntas legibles
- Reabrir formulario, exportar CSV, eliminar registros

✅ **Fase 1.A — Modelo de datos multi-formulario**
- Tablas nuevas: `coachees`, `formularios`, `asignaciones`
- Tabla `respuestas` extendida con FKs
- 5 coachees migrados, RLS aplicado
- Backup en `respuestas_backup_pre_multiform`

✅ **Fase 1.B — Hub del coachee + routing multi-formulario**
- Hook `useAsignaciones` con JOIN a formularios
- Componente `HubCoachee` con cards y contador de progreso
- Componente `FormularioCard` con estado dinámico
- `SmartRedirect`: post-login va al formulario si tiene 1 en progreso, al hub si tiene 0 o varios
- Routing nuevo: `/`, `/hub`, `/formulario/:codigo`, `/admin`
- `FormularioPage` valida asignación habilitada, botón "Volver al Hub"
- **Testeado y verificado en producción**

### Lo que está en backlog

❌ **Fase 1.C — Refactor del FormContext (próxima sesión)**
- Hoy el `FormContext` maneja UN solo formulario (Yo Real-Actual hardcoded)
- Hay que refactorearlo para soportar N formularios distintos
- Adaptar el guardado para incluir `formulario_id` y `asignacion_id`
- Esto es lo que permite agregar el formulario de Bienvenida y futuros formularios de coaches

❌ **Fase 1.D — Panel del coach refactoreado**
Pestañas "Mis Coachees" / "Mis Formularios", asignación de formularios, aprobar reaperturas.

❌ **Fase 1.E — Panel SuperAdmin con vista global**
Vista de TODOS los coachees con filtros, CRUD de coaches.

❌ **Fase 2 — Formulario de Bienvenida**
Diseño + construcción. El placeholder ya existe en la tabla `formularios` con activo=false.

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

Todos con `flujo_tipo='libre'`, asignados al super_admin (José) como coach, con asignación al formulario "Yo Real-Actual" en estado `en_progreso`.

**Único coach del sistema hoy:** José Rey (`contacto@conscienciahumana.com`) con rol `super_admin`. No hay otros coaches dados de alta. Para sumarlos hay que esperar a Fase 1.E (CRUD de coaches en UI) o hacerlo manualmente en Supabase.

---

## REGLAS DE TRABAJO EN ESTE PROYECTO

**Para Claude:**
- Cuando dudes entre opciones, dar recomendación profesional explícita.
- No mezclar contextos: si una tarea pertenece a otra fase, mencionarlo y dejarla aparte.
- Generar archivos .md para Antigravity, no chat-to-chat de prompts largos.
- Cada .md de fase debe empezar con: "Antes de ejecutar nada, leé ARQUITECTURA_multi_formulario.md".
- Separar lo que ejecuta José (SQL en Supabase) de lo que ejecuta Antigravity (código en repo).
- **Las reglas se pueden flexibilizar si José lo pide explícitamente para una tarea puntual.** No actuar como guardián rígido de las reglas; José es el dueño.

**Para Antigravity (a través de los .md):**
- Ejecutar fase por fase con checkpoints donde haga falta.
- Mostrar archivos completos cuando se modifican (no diffs parciales).
- `npm run build` después de cada cambio importante.
- Logs con prefijos: `[AUTH]`, `[FORM]`, `[ADMIN]`, `[MAIL]`, `[HUB]` según contexto.
- **Por defecto: NO commit ni push.** Pero si José lo autoriza explícitamente para una fase, está OK.

---

## CÓMO RETOMAR DESDE ACÁ

Si arrancás una sesión nueva con José y él dice "retomamos":

1. **Pregúntale por qué fase quiere arrancar.** No asumas que es la siguiente en la lista.
2. **Si dice "Fase 1.C"** → arrancar generando el .md de refactor del FormContext.
3. **Si dice "el ojo del password"** → tarea de 15 minutos.
4. **Si dice "migración del dominio"** → Fase 3.
5. **Si dice algo ambiguo** → pedir aclaración antes de generar nada.

**NUNCA empieces a generar código sin confirmar primero qué quiere hacer.**

---

## ARCHIVOS CLAVE DEL FRONTEND (post Fase 1.B)

```
src/
├── App.jsx                       (routing: /, /hub, /formulario/:codigo, /admin)
├── hooks/
│   └── useAsignaciones.js        (NUEVO - lee asignaciones del coachee)
├── components/
│   ├── routing/
│   │   └── SmartRedirect.jsx     (NUEVO - decide destino post-login)
│   ├── hub/
│   │   ├── FormularioCard.jsx    (NUEVO)
│   │   └── FormularioCard.css    (NUEVO)
│   └── form/
│       └── (componentes del formulario sin cambios)
├── pages/
│   ├── HubCoachee.jsx            (NUEVO)
│   ├── HubCoachee.css            (NUEVO)
│   ├── FormularioPage.jsx        (MODIFICADO - lee :codigo, valida asignación)
│   ├── AdminPage.jsx             (sin cambios)
│   └── LoginPage.jsx             (ojo del password pendiente)
└── context/
    ├── AuthContext.jsx           (con fix del Cargando aplicado)
    └── FormContext.jsx           (PENDIENTE de refactor en Fase 1.C)
```
