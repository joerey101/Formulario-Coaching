import ScaleInput from '../ui/ScaleInput';
import TextArea from '../ui/TextArea';
import { useFormContext } from '../../context/FormContext';
import './ChildBlock.css';

export default function ChildBlock({ index, values, onChange }) {
  const { esReadonly } = useFormContext();
  const prefix = `hijo_${index}`;
  const title = index === 1 ? 'Vínculo con hijos/as' : 'Vínculo con hijos/as adicional';
  const domain = `Hijo/a ${index}`;

  return (
    <div className="child-block">
      <h3>{title}</h3>
      <div className="textarea-field" style={{ borderTop: 'none' }}>
        <label htmlFor={`${prefix}_nombre`}>Nombre del hijo/a {index}</label>
        <input
          id={`${prefix}_nombre`}
          name={`${prefix}_nombre`}
          type="text"
          value={values[`${prefix}_nombre`] || ''}
          onChange={(e) => onChange(`${prefix}_nombre`, e.target.value)}
          disabled={esReadonly}
        />
      </div>
      <div className="question">
        <div className="question-header">
          <div className="question-title">
            En una escala del 1 al 10, ¿cómo evaluás hoy este vínculo?
          </div>
          <span className="tag">Escala</span>
        </div>
        <ScaleInput
          name={`${prefix}_score`}
          domain={domain}
          value={values[`${prefix}_score`] || ''}
          onChange={onChange}
          disabled={esReadonly}
        />
      </div>
      <TextArea
        name={`${prefix}_necesita`}
        label="¿Qué necesita más presencia, cuidado o reparación?"
        value={values[`${prefix}_necesita`]}
        onChange={onChange}
        disabled={esReadonly}
      />
      <TextArea
        name={`${prefix}_patron`}
        label="¿Qué patrón tuyo aparece con frecuencia en este vínculo?"
        value={values[`${prefix}_patron`]}
        onChange={onChange}
        disabled={esReadonly}
      />
      <TextArea
        name={`${prefix}_gesto`}
        label="¿Qué gesto concreto podrías hacer este mes para fortalecerlo?"
        value={values[`${prefix}_gesto`]}
        onChange={onChange}
        disabled={esReadonly}
      />
    </div>
  );
}
