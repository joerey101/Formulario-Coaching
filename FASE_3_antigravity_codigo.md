# FASE 3 — Auditoría de URLs en código (para Antigravity)

**Proyecto:** Sistema Multi-Formulario CONSCIENCIA
**Documento de arquitectura:** `ARQUITECTURA_multi_formulario.md` (raíz)
**Estado previo:** Fases 1.A, 1.B, 1.C y 1.D mínima ✅ en producción (branch `react-migration`)
**Ejecutor:** Antigravity
**Workflow:** Antigravity ejecuta y muestra archivos. José testea local y pushea manualmente. **NO commit ni push desde Antigravity.**

---

## ⚠️ ANTES DE EJECUTAR

1. Leé `ARQUITECTURA_multi_formulario.md` para contexto general.
2. Leé `ESTADO_ACTUAL_PROYECTO.md` para entender qué hay hecho hoy.
3. Esta fase NO toca base de datos. NO toca lógica de negocio. Es solo búsqueda y reemplazo de URLs + configuración de variables de entorno.

---

## CONTEXTO

Estamos migrando del dominio actual `https://formulario-coaching.vercel.app` al nuevo dominio `https://coaching.conscienciahumana.com`.

**Decisión clave:** las dos URLs van a convivir durante 1-2 semanas como medida de seguridad. La vieja sigue funcionando hasta que confirmemos que la nueva está 100% estable.

**Tu trabajo (Antigravity):** auditar el código del repositorio buscando URLs hardcodeadas y reemplazarlas por una variable de entorno `VITE_APP_URL` que apunte al nuevo dominio. Esto centraliza el control: si en el futuro hay que cambiar de dominio otra vez, se cambia un solo lugar.

---

## PASO 1 — Auditoría: buscar todas las URLs hardcodeadas

Ejecutá estos `grep` en la raíz del proyecto y mostrá los resultados antes de modificar nada:

```bash
# Buscar referencias al dominio viejo
grep -rn "formulario-coaching.vercel.app" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.toml" --include="*.env*" .

# Buscar URLs absolutas a Supabase (estas SÍ deben quedarse, son del backend)
grep -rn "supabase.co" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" .

# Buscar window.location o redirects que puedan tener URL absoluta
grep -rn "window.location" --include="*.js" --include="*.jsx" .

# Buscar emailRedirectTo y otros callbacks de auth
grep -rn "emailRedirectTo\|redirectTo" --include="*.js" --include="*.jsx" .

# Buscar archivos .env y configs
find . -name ".env*" -not -path "./node_modules/*" -not -path "./.git/*"
ls -la vercel.json 2>/dev/null || echo "No hay vercel.json"
```

**REPORTÁ AL CHAT** la lista de archivos encontrados con sus líneas, sin tocar nada todavía. José va a confirmar cuáles hay que cambiar.

---

## PASO 2 — Verificar/crear archivo `.env.example`

Mostrame el contenido actual de:
- `.env`
- `.env.local`
- `.env.example` (si existe)
- `.env.production` (si existe)

Si existe `.env` pero NO existe `.env.example`, creá `.env.example` con la misma estructura pero **sin los valores reales** (placeholders tipo `your-supabase-url-here`). El `.env.example` se commitea, el `.env` real no.

---

## PASO 3 — Agregar variable `VITE_APP_URL`

**En el archivo `.env.local` (o `.env`, el que esté en uso para dev):**

```env
VITE_APP_URL=http://localhost:5173
```

**En `.env.example` (para que quede documentado para futuros devs):**

```env
VITE_APP_URL=https://coaching.conscienciahumana.com
```

**IMPORTANTE:** NO crees un `.env.production` con la URL hardcodeada. Vercel maneja las variables de entorno de producción por su dashboard. José las va a configurar manualmente desde su lado.

---

## PASO 4 — Crear helper centralizado para la URL de la app

Creá el archivo `src/lib/appConfig.js`:

```js
/**
 * Configuración centralizada de URLs de la app.
 * Cambiar el dominio = cambiar una sola variable de entorno (VITE_APP_URL).
 */

// URL base de la app (sin trailing slash)
export const APP_URL = (import.meta.env.VITE_APP_URL || window.location.origin).replace(/\/$/, '');

// URLs derivadas comúnmente usadas para redirects de Auth
export const AUTH_CALLBACK_URL = `${APP_URL}/`;
export const RESET_PASSWORD_URL = `${APP_URL}/reset-password`;
export const LOGIN_URL = `${APP_URL}/login`;

// Helper para construir URLs absolutas (por ejemplo, en mails)
export const buildAppUrl = (path = '/') => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${APP_URL}${cleanPath}`;
};
```

**Notá el fallback a `window.location.origin`:** si por algún motivo `VITE_APP_URL` no está seteada, usa la URL desde donde se cargó la app. Eso hace que la app NUNCA se rompa por una variable faltante.

---

## PASO 5 — Reemplazar URLs hardcodeadas

**Esperá la confirmación de José en el chat antes de hacer este paso.** José va a revisar el reporte del Paso 1 y te va a decir cuáles archivos reemplazar.

Lugares típicos donde puede haber URLs hardcodeadas:

### 5.1 — Supabase Auth (signUp, resetPassword, magic link)

Buscar usos como:

```js
// ❌ ANTES (hardcoded)
supabase.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: 'https://formulario-coaching.vercel.app/' }
});

supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://formulario-coaching.vercel.app/reset-password'
});
```

```js
// ✅ DESPUÉS (centralizado)
import { AUTH_CALLBACK_URL, RESET_PASSWORD_URL } from '@/lib/appConfig';

supabase.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: AUTH_CALLBACK_URL }
});

supabase.auth.resetPasswordForEmail(email, {
  redirectTo: RESET_PASSWORD_URL
});
```

### 5.2 — Edge Functions con links de vuelta a la app

Si la Edge Function `send-form-notification` arma un link tipo "Ver respuesta en el admin", probablemente tiene la URL hardcodeada. Revisá la function en `supabase/functions/send-form-notification/index.ts` (o similar).

**Importante:** las Edge Functions NO usan `import.meta.env.VITE_*`. Usan `Deno.env.get('APP_URL')`. Si encontrás algo así, mostrame el código y reportamelo — eso se cambia en el dashboard de Supabase (no acá), pero te toca identificarlo.

### 5.3 — Cualquier otro lugar (mails, redirects, links externos)

Reemplazá toda URL hardcodeada por el helper de `appConfig.js`.

---

## PASO 6 — Build y verificación

```bash
npm run build
```

**Si el build falla:** mostrame el error completo y NO modifiques nada más hasta que José confirme.

**Si el build pasa:** ejecutá:

```bash
npm run dev
```

Y verificá en la consola del navegador (F12) que:
1. `import.meta.env.VITE_APP_URL` esté seteada al valor correcto
2. No haya errores en consola al cargar la app
3. El flujo de login siga funcionando

---

## PASO 7 — Reportar al chat

Cuando termines, reportá:

```
PASO 1 (auditoría URLs hardcodeadas): [lista completa de archivos y líneas]
PASO 2 (archivos .env existentes): [lista]
PASO 3 (VITE_APP_URL agregada): OK / FALLA
PASO 4 (appConfig.js creado): OK / FALLA
PASO 5 (reemplazos hechos): [lista de archivos modificados] / PENDIENTE de confirmación de José
PASO 6 (npm run build): OK / FALLA
PASO 6 (npm run dev + verificación consola): OK / FALLA
```

Y mostrame los archivos COMPLETOS de:
- `src/lib/appConfig.js` (nuevo)
- Cualquier archivo donde reemplazaste URLs (completo, no diff parcial)
- `.env.example` (nuevo o modificado)

---

## QUÉ NO HACER

❌ NO modifiques URLs de Supabase (`*.supabase.co`) — esas son del backend, se quedan.
❌ NO hagas commit ni push.
❌ NO crees `.env.production` con valores reales — Vercel lo maneja por su lado.
❌ NO toques nada de la lógica de negocio. Esto es solo migración de URLs.
❌ NO sigas al Paso 5 sin confirmación explícita de José después del reporte del Paso 1.
