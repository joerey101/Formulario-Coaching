# HOTFIX — Redirect post-login no detecta rol de coach

**Archivo a tocar:** `src/pages/LoginPage.jsx`
**Cambio:** 1 línea
**No tocar:** ningún otro archivo

---

## Problema

Cuando un coach se loguea, los logs de consola muestran correctamente:

```
[AUTH] Usuario autenticado: contacto@conscienciahumana.com
[AUTH] checkIfUserIsCoach(b9f3a517-...): ES COACH
```

Pero el usuario queda en `/` (formulario) en vez de redirigir a `/admin`.

## Causa

En `LoginPage.jsx`, después del `signIn` exitoso se ejecuta `navigate('/')` hardcoded. Este redirect ocurre ANTES de que `AuthContext` termine la verificación asíncrona contra la tabla `coaches`. Cuando `isCoach` se actualiza a `true`, el usuario ya está en `/`.

`PublicOnlyRoute` en `App.jsx` SÍ tiene la lógica correcta para redirigir según rol, pero solo se ejecuta cuando el usuario está en `/login`. Si el `navigate('/')` lo saca antes de tiempo, esa lógica no llega a aplicarse.

## Solución

Eliminar el `navigate('/')` del handler de submit en `LoginPage.jsx`. Dejar que `PublicOnlyRoute` (que envuelve a `LoginPage` en `App.jsx`) detecte el cambio de sesión + `isCoach` y redirija al destino correcto automáticamente.

## Cambio exacto

En `src/pages/LoginPage.jsx`, dentro de `handleSubmit`, **buscar y eliminar** la línea `navigate('/');`:

**ANTES:**

```jsx
} else {
  const { error } = await signIn(email, password);
  if (error) throw error;
  navigate('/');
}
```

**DESPUÉS:**

```jsx
} else {
  const { error } = await signIn(email, password);
  if (error) throw error;
  // El redirect lo maneja PublicOnlyRoute en App.jsx según el rol del usuario
}
```

Adicional: revisar si `useNavigate` y `navigate` quedan sin usar en el archivo después del cambio. Si NO se usan en ningún otro lado, eliminar:

```jsx
import { useNavigate } from 'react-router-dom';
// ...
const navigate = useNavigate();
```

Si `navigate` se sigue usando en otra parte del archivo (por ejemplo para algún otro flujo), **dejarlo**.

## Verificación

Después del cambio:

1. `npm run build` debe completar sin errores
2. NO ejecutar commit ni push (José testea primero en local)

## Reporte esperado

- Archivo modificado: `src/pages/LoginPage.jsx`
- Líneas eliminadas: 1 (el `navigate('/')`) + 2 si quedan sin uso (`useNavigate` import + `const navigate`)
- Resultado del build: success / error
