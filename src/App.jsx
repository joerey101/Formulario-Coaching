import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FormProvider } from './context/FormContext';
import FormularioPage from './pages/FormularioPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';

// Componente para proteger rutas de coachees
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen">Cargando sesión...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <FormProvider>
          <Routes>
            {/* Página de Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* El formulario protegido */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <FormularioPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Panel de Administración (Sigue con su propio login interno por ahora) */}
            <Route path="/admin" element={<AdminPage />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </FormProvider>
      </AuthProvider>
    </Router>
  );
}
