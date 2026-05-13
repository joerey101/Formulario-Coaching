import { FormProvider } from './context/FormContext';
import FormularioPage from './pages/FormularioPage';

export default function App() {
  return (
    <FormProvider>
      <FormularioPage />
    </FormProvider>
  );
}
