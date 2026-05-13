import ProgressBar from '../ui/ProgressBar';
import Button from '../ui/Button';
import useFormProgress from '../../hooks/useFormProgress';
import useAutoSave from '../../hooks/useAutoSave';
import { useForm } from '../../context/FormContext';
import './StickyActions.css';

export default function StickyActions() {
  const { percent } = useFormProgress();
  const { save, clear: clearStorage } = useAutoSave();
  const { state, submitData, clear, collectData } = useForm();

  const handleSubmit = async () => {
    const success = await submitData();
    if (success) {
      alert('¡Formulario enviado al servidor exitosamente!');
    } else {
      alert('Error al enviar el formulario. Intentá nuevamente.');
    }
  };

  const handleExport = () => {
    const data = collectData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yo-real-actual-respuestas.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (!confirm('¿Seguro que querés limpiar las respuestas?')) return;
    clearStorage();
    clear();
  };

  return (
    <div className="sticky-actions no-print">
      <ProgressBar percent={percent} />
      <div className="button-row">
        <Button onClick={save}>Guardar Borrador</Button>
        <Button onClick={handleSubmit} disabled={state.submitting}>
          {state.submitting ? 'Enviando...' : 'Enviar al Servidor'}
        </Button>
        <Button variant="secondary" onClick={handleExport}>Exportar</Button>
        <Button variant="green" onClick={() => window.print()}>PDF / imprimir</Button>
        <Button variant="ghost" onClick={handleClear}>Limpiar</Button>
      </div>
    </div>
  );
}
