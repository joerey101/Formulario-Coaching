import ScaleInput from '../ui/ScaleInput';
import TextArea from '../ui/TextArea';
import { useFormContext } from '../../context/FormContext';
import './DomainCard.css';

export default function DomainCard({ domain, slug, values, onChange }) {
  const { esReadonly } = useFormContext();
  return (
    <div className="domain-card">
      <h3>{domain}</h3>
      <div className="question">
        <div className="question-header">
          <div className="question-title">
            En una escala del 1 al 10, ¿cómo está hoy este dominio?
          </div>
          <span className="tag">Escala</span>
        </div>
        <ScaleInput
          name={`${slug}_score`}
          domain={domain}
          value={values[`${slug}_score`] || ''}
          onChange={onChange}
          disabled={esReadonly}
        />
      </div>
      <TextArea
        name={`${slug}_estado`}
        label="¿Cómo está hoy, concretamente?"
        value={values[`${slug}_estado`]}
        onChange={onChange}
        disabled={esReadonly}
      />
      <TextArea
        name={`${slug}_patron`}
        label="¿Qué patrón tuyo se repite en este dominio?"
        value={values[`${slug}_patron`]}
        onChange={onChange}
        disabled={esReadonly}
      />
      <TextArea
        name={`${slug}_necesita`}
        label="¿Qué necesita atención, orden o corrección?"
        value={values[`${slug}_necesita`]}
        onChange={onChange}
        disabled={esReadonly}
      />
    </div>
  );
}
