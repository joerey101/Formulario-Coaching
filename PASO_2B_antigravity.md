# PASO 2B — Antigravity (ejecutar después que José termine 2A)

**Proyecto:** Formulario de Autoobservación 360° — CONSCIENCIA
**Repositorio local:** ruta del repo clonado
**Rama:** `react-migration`
**Asume:** la tabla `coaches` ya existe en Supabase, el coach `contacto@conscienciahumana.com` ya está creado, las URLs de redirect ya están configuradas.

---

## 🎯 Objetivo

Eliminar el login hardcodeado del admin (`JOrtiz` / `Poder2026!`) y migrar a Supabase Auth con verificación de rol contra tabla `coaches`. Agregar flujo de recuperación de contraseña.

## ⚠️ Restricciones

- **NO TOCAR:** `src/context/FormContext.jsx`, `src/hooks/*`, `src/pages/FormularioPage.jsx`, `src/components/form/*`, `src/components/ui/*`, `src/components/layout/*`, tabla `respuestas`.
- **Entregar archivos completos**, no snippets.
- **Logs con prefijo `[AUTH]`** en todos los cambios de auth.
- **Ejecutar fase por fase**, mostrar output después de cada fase y esperar confirmación antes de seguir.

---

## FASE 1 — Crear `src/lib/coaches.js`

Archivo nuevo:

```javascript
// src/lib/coaches.js
import { supabase } from './supabase';

export async function checkIfUserIsCoach(userId) {
  if (!userId) {
    console.log('[AUTH] checkIfUserIsCoach: userId vacío');
    return { isCoach: false, coachData: null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('coaches')
      .select('id, user_id, email, nombre, apellido, especialidad, activo')
      .eq('user_id', userId)
      .eq('activo', true)
      .maybeSingle();

    if (error) {
      console.error('[AUTH] Error verificando rol de coach:', error);
      return { isCoach: false, coachData: null, error };
    }

    const isCoach = !!data;
    console.log(`[AUTH] checkIfUserIsCoach(${userId}):`, isCoach ? 'ES COACH' : 'NO ES COACH');
    return { isCoach, coachData: data, error: null };
  } catch (err) {
    console.error('[AUTH] Excepción en checkIfUserIsCoach:', err);
    return { isCoach: false, coachData: null, error: err };
  }
}
```

**STOP. Mostrar output y esperar OK antes de la Fase 2.**

---

## FASE 2 — Reemplazar `src/context/AuthContext.jsx`

Archivo completo:

```jsx
// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { checkIfUserIsCoach } from '../lib/coaches';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isCoach, setIsCoach] = useState(false);
  const [coachData, setCoachData] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateAuthState = async (newSession) => {
    setSession(newSession);
    const currentUser = newSession?.user ?? null;
    setUser(currentUser);

    if (currentUser) {
      console.log('[AUTH] Usuario autenticado:', currentUser.email);
      const { isCoach: userIsCoach, coachData: data } = await checkIfUserIsCoach(currentUser.id);
      setIsCoach(userIsCoach);
      setCoachData(data);
    } else {
      console.log('[AUTH] Sin usuario autenticado');
      setIsCoach(false);
      setCoachData(null);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session).finally(() => setLoading(false));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        console.log('[AUTH] onAuthStateChange:', _event);
        await updateAuthState(newSession);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    console.log('[AUTH] Intento de login:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) console.error('[AUTH] Error en signIn:', error.message);
    return { data, error };
  };

  const signUp = async (email, password) => {
    console.log('[AUTH] Intento de registro:', email);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) console.error('[AUTH] Error en signUp:', error.message);
    return { data, error };
  };

  const signOut = async () => {
    console.log('[AUTH] Cerrando sesión');
    const { error } = await supabase.auth.signOut();
    if (error) console.error('[AUTH] Error en signOut:', error.message);
    return { error };
  };

  const resetPassword = async (email) => {
    console.log('[AUTH] Solicitud de reset password para:', email);
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) console.error('[AUTH] Error en resetPassword:', error.message);
    return { data, error };
  };

  const value = {
    user,
    session,
    isCoach,
    coachData,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
```

**STOP. Mostrar output y esperar OK antes de la Fase 3.**

---

## FASE 3 — Reemplazar `src/App.jsx`

Archivo completo:

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FormProvider } from './context/FormContext';
import LoginPage from './pages/LoginPage';
import FormularioPage from './pages/FormularioPage';
import AdminPage from './pages/AdminPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      color: '#666'
    }}>
      Cargando…
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function CoachRoute({ children }) {
  const { user, isCoach, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isCoach) {
    console.warn('[AUTH] Usuario no-coach intentó acceder a /admin. Redirigiendo a /');
    return <Navigate to="/" replace />;
  }
  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, isCoach, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) {
    return <Navigate to={isCoach ? '/admin' : '/'} replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <FormProvider>
              <FormularioPage />
            </FormProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <CoachRoute>
            <AdminPage />
          </CoachRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
```

**STOP. Mostrar output y esperar OK antes de la Fase 4.**

---

## FASE 4 — Modificar `src/pages/AdminPage.jsx`

Tareas obligatorias:

1. **Eliminar TODO el código del login interno hardcodeado** del archivo: variables, formulario, estados, referencias a `JOrtiz` y `Poder2026!`.
2. **Importar y usar `useAuth`** para acceder a `coachData` y `signOut`.
3. **Cargar respuestas con `supabase.from('respuestas').select('*').order('created_at', { ascending: false })`** directamente al montar el componente.
4. **Header del panel:** título "Panel de Coach", subtítulo con `${coachData.nombre} ${coachData.apellido}`, botón "Cerrar Sesión" que llame a `signOut()` y luego `navigate('/login')`.
5. **Conservar EXACTAMENTE** la UI y funcionalidad existente: búsqueda por nombre/email, estadísticas (total, del mes), modal de detalle, exportar CSV, eliminar registro con confirmación, imprimir desde modal.
6. **Conservar** todos los estilos de `AdminPage.css` que aplicaban a la tabla, modal y botones. Solo eliminar estilos del login interno que ya no existe.

Imports necesarios al inicio del archivo:

```jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './AdminPage.css';
```

**STOP. Mostrar output (archivo completo, no diff) y esperar OK antes de la Fase 5.**

---

## FASE 5 — Modificar `src/pages/LoginPage.jsx` y `LoginPage.css`

Agregar al componente existente, debajo del formulario de login actual, un bloque de recuperación de contraseña.

**En `LoginPage.jsx`:**

1. Importar `useAuth` (si no está ya).
2. Agregar estado:
   ```jsx
   const [showResetForm, setShowResetForm] = useState(false);
   const [resetEmail, setResetEmail] = useState('');
   const [resetMessage, setResetMessage] = useState('');
   const { resetPassword } = useAuth();
   ```
3. Agregar handler:
   ```jsx
   const handleResetPassword = async (e) => {
     e.preventDefault();
     setResetMessage('');
     const { error } = await resetPassword(resetEmail);
     if (error) {
       setResetMessage(`Error: ${error.message}`);
     } else {
       setResetMessage(
         'Te enviamos un mail con instrucciones para resetear tu contraseña. ' +
         'Revisá tu bandeja de entrada (y spam por las dudas).'
       );
     }
   };
   ```
4. Agregar al JSX, debajo del formulario de login:
   ```jsx
   <div className="reset-password-section">
     {!showResetForm ? (
       <button
         type="button"
         className="link-button"
         onClick={() => setShowResetForm(true)}
       >
         ¿Olvidaste tu contraseña?
       </button>
     ) : (
       <form onSubmit={handleResetPassword} className="reset-form">
         <input
           type="email"
           placeholder="Tu email"
           value={resetEmail}
           onChange={(e) => setResetEmail(e.target.value)}
           required
         />
         <button type="submit">Enviar mail de recuperación</button>
         <button type="button" onClick={() => setShowResetForm(false)}>
           Cancelar
         </button>
         {resetMessage && <p className="reset-message">{resetMessage}</p>}
       </form>
     )}
   </div>
   ```

**En `LoginPage.css`:** agregar estilos para `.reset-password-section`, `.link-button`, `.reset-form` y `.reset-message`, coherentes con el branding violeta de CONSCIENCIA ya existente en el archivo.

**STOP. Mostrar archivos completos y esperar OK antes de la Fase 6.**

---

## FASE 6 — Crear `src/pages/ResetPasswordPage.jsx` y `ResetPasswordPage.css`

**`ResetPasswordPage.jsx`:**

```jsx
// src/pages/ResetPasswordPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './ResetPasswordPage.css';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log('[AUTH] Reset page - event:', event);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage('Contraseña actualizada. Redirigiendo al login…');
      setTimeout(() => navigate('/login'), 2500);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <h1>Nueva Contraseña</h1>
        <p className="instructions">
          Ingresá tu nueva contraseña. Tiene que tener al menos 6 caracteres.
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            Nueva contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>

          <label>
            Confirmar contraseña
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? 'Actualizando…' : 'Actualizar contraseña'}
          </button>

          {message && <p className="message">{message}</p>}
        </form>
      </div>
    </div>
  );
}
```

**`ResetPasswordPage.css`:** estilos coherentes con `LoginPage.css` (mismo layout centrado, mismo branding violeta de CONSCIENCIA, mismas fuentes y radios).

**STOP. Mostrar archivos y esperar OK antes de la Fase 7.**

---

## FASE 7 — Cleanup local (SIN COMMIT, SIN PUSH)

**IMPORTANTE: esta fase NO hace commit ni push. José va a testear primero en localhost y después él mismo hace el commit/push manualmente. Antigravity termina su trabajo dejando todo listo en el working tree local.**

1. Buscar y eliminar cualquier referencia residual:
   ```bash
   grep -ri "JOrtiz" src/
   grep -ri "Poder2026" src/
   ```
   Ambos deben devolver vacío. Si hay coincidencias, eliminar.

2. Verificar que ningún import roto quedó suelto. Revisar especialmente que `App.jsx` importe `ResetPasswordPage` y que `AdminPage.jsx` no tenga imports muertos.

3. Verificar que el build no rompa:
   ```bash
   npm run build
   ```
   Debe completar sin errores. Si hay errores, corregir antes de finalizar.

4. **NO ejecutar `git add`, `git commit` ni `git push`.** Dejar los cambios en el working tree para que José los revise.

5. Reportar al usuario:
   - Lista exacta de archivos creados/modificados
   - Resultado de los `grep` (vacío esperado)
   - Resultado del `npm run build` (success esperado)
   - Mensaje literal: "Listo para que ejecutes `npm run dev` y testees en localhost. Cuando confirmes que todo funciona, hacés vos el commit y push manual."

---

## 📦 Archivos esperados al final

| Archivo | Acción |
|---|---|
| `src/lib/coaches.js` | nuevo |
| `src/context/AuthContext.jsx` | reemplazado |
| `src/App.jsx` | reemplazado |
| `src/pages/AdminPage.jsx` | modificado |
| `src/pages/LoginPage.jsx` | modificado |
| `src/pages/LoginPage.css` | modificado |
| `src/pages/ResetPasswordPage.jsx` | nuevo |
| `src/pages/ResetPasswordPage.css` | nuevo |
