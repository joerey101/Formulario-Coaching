import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FormProvider } from './context/FormContext';
import FormularioPage from './pages/FormularioPage';

export default function App() {
  return (
    <Router>
      <FormProvider>
        <Routes>
          {/* El formulario es la raíz del sitio, directo y sin vueltas */}
          <Route path="/" element={<FormularioPage />} />
          
          {/* Por si alguien escribe la URL completa */}
          <Route path="/formulariocoaching" element={<FormularioPage />} />
          
          {/* Fallback a la raíz */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </FormProvider>
    </Router>
  );
}
