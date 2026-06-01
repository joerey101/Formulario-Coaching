# HOTFIX — Routing post-login según rol (Coach vs Coachee)

**Proyecto:** Sistema Multi-Formulario CONSCIENCIA
**Tipo:** Hotfix puntual (no es una fase nueva)
**Ejecutor:** Antigravity
**Workflow:** Antigravity ejecuta y muestra archivos. José testea local y pushea manualmente. **NO commit ni push desde Antigravity.**
**Tiempo estimado:** 15-20 minutos

---

## ⚠️ ANTES DE EJECUTAR

1. Confirmá que estás en la branch `react-migration`.
2. Confirmá que el último commit en local es `fix(admin): coherencia entre asignaciones y respuestas para Fase 1.D mínima`.
3. `npm run dev` debe levantar bien antes de tocar nada.

---

## CONTEXTO

Hoy el `SmartRedirect.jsx` (creado en Fase 1.B) decide a dónde mandar al usuario post-login. Pero solo contempla coachees:
- Si tiene 1 asignación habilitada → al formulario directo
- Si tiene 0 o varias → al hub `/`

**Bug detectado:** Juan Martín Ortiz (rol `coach` en la tabla `coaches`) se logueó y le apareció el hub de coachee vacío con el mensaje "Aún no tienes formularios asignados". Lo correcto es que un usuario con rol coach (o super_admin) vaya directo a `/admin`.

**Comportamiento esperado:**

| Tipo de usuario | Destino post-login |
|---|---|
| Usuario está en tabla `coaches` (rol `coach` o `super_admin`, activo) | `/admin` |
| Usuario es coachee con 1 asignación habilitada en estado no finalizado | `/formulario/:codigo` (directo) |
| Usuario es coachee con 0 o varias asignaciones | `/` (hub) |
| Usuario sin rol ni asignaciones | `/` (hub muestra "Aún no tienes formularios asignados") |

---

## PASO 0 — Inspección

Antes de tocar nada, leé y reportá en el chat el contenido completo actual de:

1. `src/components/routing/SmartRedirect.jsx`
2. Cualquier otro lugar del routing donde se decida dónde mandar al usuario post-login (revisar `App.jsx`, `AuthContext.jsx`, `LoginPage.jsx` por si hay redirects duplicados).

**Checkpoint 1:** reportá los archivos y dónde está hoy la lógica de redirección. José revisa antes de seguir.

---

## PASO 1 — Modificar SmartRedirect

### 1.1 — Lógica nueva

`SmartRedirect.jsx` debe:

1. Esperar a que `useAuth()` termine de cargar el usuario.
2. **Primero verificar si el usuario es coach** consultando la tabla `coaches`:
   - Query: `SELECT id, rol FROM coaches WHERE user_id = <auth.uid()> AND activo = true LIMIT 1`
   - Si devuelve fila → `navigate('/admin', { replace: true })`
3. **Si NO es coach**, hacer lo que ya hace hoy (leer asignaciones):
   - Si tiene 1 asignación habilitada en estado `no_iniciado` o `en_progreso` → ir al formulario
   - Caso contrario → ir al hub

### 1.2 — Estructura sugerida

```javascript
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const SmartRedirect = () => {
  const { user, loading: loadingAuth } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const decidirDestino = async () => {
      if (loadingAuth) return;
      
      if (!user) {
        setChecking(false);
        return;
      }

      console.log('[ROUTING] Decidiendo destino post-login para:', user.email);

      // 1. ¿Es coach o super_admin?
      const { data: coach, error: errorCoach } = await supabase
        .from('coaches')
        .select('id, rol')
        .eq('user_id', user.id)
        .eq('activo', true)
        .maybeSingle();

      if (errorCoach) {
        console.error('[ROUTING] Error consultando coaches:', errorCoach);
      }

      if (coach) {
        console.log(`[ROUTING] Usuario es coach (rol: ${coach.rol}) → /admin`);
        navigate('/admin', { replace: true });
        return;
      }

      // 2. No es coach → es coachee, leer asignaciones
      const { data: asignaciones, error: errorAsig } = await supabase
        .from('asignaciones')
        .select(`
          id,
          habilitado,
          estado,
          formularios:formulario_id ( codigo )
        `)
        .eq('coachee_user_id', user.id)
        .eq('habilitado', true)
        .in('estado', ['no_iniciado', 'en_progreso']);

      if (errorAsig) {
        console.error('[ROUTING] Error consultando asignaciones:', errorAsig);
        navigate('/hub', { replace: true });
        return;
      }

      if (asignaciones && asignaciones.length === 1) {
        const codigo = asignaciones[0].formularios?.codigo;
        if (codigo) {
          console.log(`[ROUTING] 1 asignación activa → /formulario/${codigo}`);
          navigate(`/formulario/${codigo}`, { replace: true });
          return;
        }
      }

      console.log(`[ROUTING] ${asignaciones?.length ?? 0} asignaciones → /hub`);
      navigate('/hub', { replace: true });
    };

    decidirDestino();
  }, [user, loadingAuth, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-muted)' }}>
      Redirigiendo...
    </div>
  );
};

export default SmartRedirect;
```

### 1.3 — Adaptaciones

**Atención:** ajustá los nombres de variables y paths según cómo esté escrito el SmartRedirect actual. Lo de arriba es estructura, no copy-paste literal. Si hoy usa `useAsignaciones`, agregá la verificación de coach **ANTES** de leer asignaciones para evitar queries innecesarias.

**Checkpoint 2:** mostrá el `SmartRedirect.jsx` completo refactoreado. José revisa antes de seguir.

---

## PASO 2 — Verificar que no haya otros redirects que pisen este

Revisar:

1. **`LoginPage.jsx`:** después del login exitoso, ¿hace algún `navigate(...)` directo? Si lo hace, debe ir a `/` (que es donde está montado SmartRedirect) y dejar que SmartRedirect decida. Si redirige directo a `/hub` o a `/formulario/...`, sacar ese navigate y dejar el SmartRedirect a cargo.

2. **`App.jsx`:** confirmar que la ruta `/` siga montando `<SmartRedirect />`. Si hay un guard o un wrapper raro, mencionarlo.

3. **`AuthContext.jsx`:** si hace algún redirect al detectar login, debe ir a `/` y dejar que SmartRedirect decida.

Si hay redirects duplicados que ya van directo al hub, eso es por qué el bug se nota más. Limpialos.

**Reportá en el chat:** ¿había algún redirect duplicado? ¿En qué archivo?

---

## PASO 3 — Build local

```bash
npm run build
```

Si falla, pegame el error completo. Si pasa, levantá local con `npm run dev`.

---

## PASO 4 — Tests funcionales (José los hace, NO Antigravity)

### Test A — Coach va a /admin
1. Login como `juan.ortiz@conscienciahumana.com`
2. Esperado: redirige a `/admin`
3. Ve el panel del admin

### Test B — SuperAdmin va a /admin
1. Login como `contacto@conscienciahumana.com`
2. Esperado: redirige a `/admin`
3. Ve el panel del admin con todos los coachees

### Test C — Coachee con 1 asignación activa va al formulario
1. Login como `josereyplay4@gmail.com`
2. Esperado: redirige directo a `/formulario/yo_real_actual`

### Test D — Coachee con asignación finalizada va al hub
1. Si hay algún coachee finalizado, login
2. Esperado: redirige al hub

### Test E — Acceso directo a /admin como coachee (observacional, no romper)
1. Login como `josereyplay4@gmail.com`
2. En la URL escribir `/admin`
3. Reportar comportamiento (si lo deja entrar, si redirige, etc). NO arreglar en este hotfix.

---

## PASO 5 — Checklist final

- [ ] SmartRedirect verifica primero si el usuario es coach
- [ ] Si es coach o super_admin → `/admin`
- [ ] Si es coachee con 1 asignación activa → `/formulario/:codigo`
- [ ] Si es coachee sin asignaciones o con varias → `/hub`
- [ ] No hay redirects duplicados que pisen al SmartRedirect
- [ ] Logs con prefijo `[ROUTING]`
- [ ] Build pasa sin errores
- [ ] Antigravity NO hizo commit ni push

---

## CRITERIO DE ÉXITO

El hotfix está completo cuando:

1. Juan Martín Ortiz al loguearse va directo a `/admin` (no al hub vacío).
2. José sigue yendo a `/admin` como siempre.
3. Los coachees siguen yendo al formulario o al hub según corresponda.
4. No se rompe ningún flujo existente.

---

## REPORTE FINAL

Al terminar, reportar en este formato:

```
PASO 0 (inspección): OK + reporte de archivos encontrados
PASO 1 (SmartRedirect modificado): OK / archivo mostrado en checkpoint 2
PASO 2 (verificación de redirects duplicados): SIN DUPLICADOS / [si hay, listar dónde]
PASO 3 (build): OK / ERROR [pegar error si hubo]

DECISIONES TOMADAS POR ANTIGRAVITY:
- [si las hubo]
```

Quedo a la espera del primer reporte (PASO 0).
