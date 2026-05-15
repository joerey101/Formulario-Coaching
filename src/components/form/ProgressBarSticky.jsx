// src/components/form/ProgressBarSticky.jsx
import { useFormContext } from '../../context/FormContext';
import './ProgressBarSticky.css';

export default function ProgressBarSticky({ onGuardar, guardando, deshabilitado }) {
  const { progreso } = useFormContext(); // Reutiliza el cálculo de progreso ya existente
  
  return (
    <div className={`progress-sticky ${deshabilitado ? 'progress-sticky--readonly' : ''}`}>
      <div className="progress-sticky__inner">
        <div className="progress-sticky__bar-container">
          <div className="progress-sticky__bar-header">
            <span className="progress-sticky__label">Avance de respuestas</span>
            <span className="progress-sticky__percent">{progreso}%</span>
          </div>
          <div className="progress-sticky__track">
            <div 
              className="progress-sticky__fill" 
              style={{ width: `${progreso}%` }}
              role="progressbar"
              aria-valuenow={progreso}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
        <button 
          className="progress-sticky__save-btn"
          onClick={onGuardar}
          disabled={guardando || deshabilitado}
        >
          {guardando ? 'Guardando…' : 'Guardar Recorrido'}
        </button>
      </div>
    </div>
  );
}
