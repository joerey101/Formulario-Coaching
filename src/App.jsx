import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import HubCoachee from './pages/HubCoachee';
import FormularioPage from './pages/FormularioPage';
import AdminPage from './pages/AdminPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SmartRedirect from './components/routing/SmartRedirect';

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
  const { user, isCoach, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (isCoach) {
    console.log('[AUTH] Coach detectado en ruta protegida de coachee. Redirigiendo a /admin');
    return <Navigate to="/admin" replace />;
  }
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

      {/* Ruta raíz del coachee: redirección inteligente */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SmartRedirect />
          </ProtectedRoute>
        }
      />

      {/* Hub del coachee (acceso directo) */}
      <Route
        path="/hub"
        element={
          <ProtectedRoute>
            <HubCoachee />
          </ProtectedRoute>
        }
      />

      <Route
        path="/formulario/:codigo"
        element={
          <ProtectedRoute>
            <FormularioPage />
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
