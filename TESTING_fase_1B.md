# TESTING LOCAL — FASE 1.B (Hub del coachee + routing nuevo)

**Estado:** Antigravity terminó las 7 fases. Build OK en 279ms, sin warnings. Todo en working tree, sin commit.

**Importante:** la Fase 1.B cambia el routing del sistema. **No deployar antes de testear todo en local.**

---

## Setup

```bash
npm run dev
```

Abrí `http://localhost:5173` en **ventana incógnito** (importante, para no arrastrar sesiones viejas).
Mantené **consola abierta (F12)** para ver logs `[HUB]` y `[AUTH]`.

**Credenciales de testing:**
- Coachee con 1 formulario en progreso: `josereyplay4@gmail.com` (tu password)
- Coach: `contacto@conscienciahumana.com` / `Poder2026!`

---

## Test 1 — Coachee con 1 formulario en progreso (caso más común hoy)

`josereyplay4@gmail.com` tiene UNA sola asignación habilitada en estado `en_progreso`. SmartRedirect debe llevarlo directo al formulario, sin pasar por el hub.

**Pasos:**
1. Login con `josereyplay4@gmail.com`

**Verificar:**
- [ ] URL final: `http://localhost:5173/formulario/yo_real_actual` (NO `/hub`)
- [ ] Se ve el formulario con datos cargados (Jose Test 001, etc.)
- [ ] En consola aparece:
  - `[HUB] Asignaciones cargadas: 1`
  - `[HUB] SmartRedirect: 1 formulario en progreso, redirigiendo a /formulario/yo_real_actual`
- [ ] En el header del formulario aparece el botón "← Volver al Hub"

---

## Test 2 — Botón "Volver al Hub"

Estando en el formulario del Test 1, click en "← Volver al Hub".

**Verificar:**
- [ ] URL cambia a `http://localhost:5173/hub`
- [ ] Se ve el header del hub con tu email
- [ ] Aparece el contador "0 de 1 formularios completados" + barra de progreso
- [ ] Aparece 1 card del formulario "Yo Real-Actual"
- [ ] La card muestra:
  - Badge naranja "✏️ En progreso"
  - Tag violeta "CONSCIENCIA"
  - Título "Yo Real-Actual"
  - Descripción
  - Botón violeta "Continuar"

---

## Test 3 — Botón "Continuar" de la card

Click en el botón "Continuar" de la card.

**Verificar:**
- [ ] URL cambia a `http://localhost:5173/formulario/yo_real_actual`
- [ ] Vuelve al formulario con los datos cargados
- [ ] No hay reload de página completa (navegación SPA)

---

## Test 4 — Logout y vuelta al login

Estando en el hub o en el formulario, click en "Cerrar Sesión".

**Verificar:**
- [ ] URL: `http://localhost:5173/login`
- [ ] En consola: `[AUTH] Cerrando sesión`

Login de nuevo con `josereyplay4@gmail.com`:
- [ ] Vuelve directo a `/formulario/yo_real_actual` (SmartRedirect funciona post-login)

---

## Test 5 — Coach se loguea (asegurar que no se rompió la auth)

Logout. Login con `contacto@conscienciahumana.com` / `Poder2026!`.

**Verificar:**
- [ ] URL final: `http://localhost:5173/admin`
- [ ] Se ve el Panel de Coach normal
- [ ] NO pasa por SmartRedirect (porque la ruta `/admin` es directa para coaches)
- [ ] En consola: `[AUTH] checkIfUserIsCoach(...): ES COACH`

---

## Test 6 — Coachee intenta acceder a /admin

Logout. Login con `josereyplay4@gmail.com`. En la barra de URL, escribir manualmente:
`http://localhost:5173/admin`

**Verificar:**
- [ ] Redirige a `/` → SmartRedirect → `/formulario/yo_real_actual`
- [ ] En consola: `[AUTH] Usuario no-coach intentó acceder a /admin. Redirigiendo a /`

---

## Test 7 — URL inexistente

En la barra de URL, escribir manualmente:
`http://localhost:5173/cualquier-cosa-que-no-existe`

**Verificar:**
- [ ] Redirige a `/` → SmartRedirect → `/formulario/yo_real_actual` (caso coachee logueado)
- [ ] No aparece página de error 404

---

## Test 8 — Acceso directo a /hub

En la barra de URL, escribir:
`http://localhost:5173/hub`

**Verificar:**
- [ ] Carga el hub (no redirige a formulario)
- [ ] Muestra la card como en Test 2

> 💡 Este es el caso "el coachee elige ver el hub aunque tenga 1 solo formulario". El SmartRedirect solo decide cuando entra por `/`, no cuando entra directo a `/hub`.

---

## Test 9 — Coachee intenta acceder a formulario sin asignación

En la barra de URL, escribir manualmente:
`http://localhost:5173/formulario/bienvenida`

**Verificar:**
- [ ] Redirige a `/hub`
- [ ] En consola: `[HUB] Coachee no tiene asignación habilitada para: bienvenida`

> 💡 El formulario "bienvenida" existe en la tabla `formularios` pero `josereyplay4` no tiene asignación habilitada para él (su única asignación es a "yo_real_actual"). La validación del useEffect modificado debe atraparlo.

---

## Test 10 — URL con código que no existe

En la barra de URL, escribir manualmente:
`http://localhost:5173/formulario/formulario-inventado`

**Verificar:**
- [ ] Redirige a `/hub`
- [ ] En consola: warning de "no tiene asignación habilitada"

---

## Reporte

Pegar en el chat:

```
Test 1 (1 formulario en progreso → directo): OK / FALLA
Test 2 (Volver al Hub): OK / FALLA
Test 3 (Continuar desde card): OK / FALLA
Test 4 (Logout y re-login): OK / FALLA
Test 5 (Coach a /admin): OK / FALLA
Test 6 (Coachee a /admin redirige): OK / FALLA
Test 7 (URL inexistente): OK / FALLA
Test 8 (acceso directo a /hub): OK / FALLA
Test 9 (formulario sin asignación): OK / FALLA
Test 10 (código de formulario inválido): OK / FALLA
```

Si todos OK → commit y push.
Si algo falla → reportar qué exactamente.

---

## Comando de commit/push si todo OK

```bash
git add src/hooks/useAsignaciones.js \
        src/pages/HubCoachee.jsx \
        src/pages/HubCoachee.css \
        src/components/hub/FormularioCard.jsx \
        src/components/hub/FormularioCard.css \
        src/components/routing/SmartRedirect.jsx \
        src/App.jsx \
        src/pages/FormularioPage.jsx

git commit -m "feat(hub): Fase 1.B - Hub del coachee + routing multi-formulario

- Nuevo hook useAsignaciones que lee asignaciones del coachee con JOIN a formularios
- Componente HubCoachee con cards en grilla y contador de progreso global
- Componente FormularioCard con estado visual dinámico (bloqueado/disponible/en_progreso/finalizado)
- SmartRedirect: redirección inteligente post-login según asignaciones en progreso
- App.jsx refactoreado: '/' usa SmartRedirect, '/hub' acceso directo al hub,
  '/formulario/:codigo' para cada formulario específico
- FormularioPage modificado: lee :codigo del URL, valida asignación habilitada,
  botón 'Volver al Hub' en header
- Sin cambios en FormContext ni lógica del formulario (queda para Fase 1.C)
- Backward compatible: coachees existentes siguen funcionando exactamente igual"

git push origin react-migration
```

Vercel auto-deploya. Después de 1-2 minutos podés probar en `https://formulario-coaching.vercel.app`.

---

## Heads-up importante

**El formulario sigue funcionando EXACTAMENTE igual desde adentro.** Esta fase NO refactoreó el FormContext (eso es Fase 1.C). Cuando el coachee se loguea, sigue cargando sus respuestas como antes. Lo único que cambió es CÓMO LLEGA al formulario (a través de SmartRedirect o del hub).
