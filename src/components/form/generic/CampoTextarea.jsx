import React from 'react';
import { useForm } from '../../../context/FormContext';

/**
 * Campo de textarea genérico. Lee y escribe en state.respuestas[name] del FormContext.
 *
 * Props:
 * - name: string — clave del campo en respuestas (ej: 'pareja_relacion_un_anio')
 * - label: string — pregunta visible
 * - hint?: string — texto auxiliar bajo la pregunta
 * - rows?: number — altura del textarea (default 4)
 * - placeholder?: string
 * - readOnly?: boolean — si true, no permite editar (modo finalizado)
 */
const CampoTextarea = ({ name, label, hint, rows = 4, placeholder, readOnly = false }) => {
  const { state, setRespuesta } = useForm();
  const value = state.respuestas?.[name] || '';

  const handleChange = (e) => {
    if (readOnly) return;
    setRespuesta(name, e.target.value);
  };

  return (
    <div className="campo-textarea">
      <label htmlFor={name} className="campo-textarea-label">
        {label}
      </label>
      {hint && <p className="campo-textarea-hint">{hint}</p>}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        rows={rows}
        placeholder={placeholder}
        readOnly={readOnly}
        className="campo-textarea-input"
      />
    </div>
  );
};

export default CampoTextarea;
