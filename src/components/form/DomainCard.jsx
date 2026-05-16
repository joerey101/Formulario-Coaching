import ScaleInput from '../ui/ScaleInput';
import TextArea from '../ui/TextArea';
import { useFormContext } from '../../context/FormContext';
import './DomainCard.css';
const PREGUNTAS_POR_DOMINIO = {
  'vinculos_y_relaciones': {
    score_label: 'Cómo calificarías este Dominio?',
    pregunta_estado: 'Describe qué relaciones sientes que te nutren y cuáles te agotan; ¿qué diferencias concretas observas entre ellas?',
    pregunta_patron: 'Piensa en tus vínculos más cercanos: ¿en cuáles te reconoces dependiente y en cuáles te sientes más auténtico? Da ejemplos.',
    pregunta_necesita: '¿Qué señales te muestran que una relación es constructiva o tóxica para vos, y cómo reaccionás habitualmente ante cada una?',
  },
  'salud_y_vitalidad': {
    score_label: 'Cómo calificarías este Dominio?',
    pregunta_estado: 'Qué percepción tenés hoy a nivel general sobre tu salud? Cómo sos a la hora de cuidar tu cuerpo?',
    pregunta_patron: '¿Ves algún patrón que se repite con respecto a tu autocuidado?',
    pregunta_necesita: '¿Qué necesita atención, orden o corrección?',
  },
  'proposito_y_carrera': {
    score_label: 'Cómo calificarías este Dominio?',
    pregunta_estado: 'Qué es lo primero que te viene cuando pensás en tu propósito de vida?',
    pregunta_patron: 'Qué emociones te vienen con las palabras Propósito, Vocación?',
    pregunta_necesita: 'Te gustaría que pase algo al respecto?',
  },
  'finanzas_y_abundancia': {
    score_label: 'Cómo calificarías este Dominio?',
    pregunta_estado: '¿Cómo te sentís en este dominio?',
    pregunta_patron: '¿Cuál es tu relación actual con el dinero? ¿Crees que tienes pensamientos y emociones saludables hacia él o hay aspectos que necesitan trabajo?',
    pregunta_necesita: 'Visualiza tu vida financiera ideal. ¿Qué nivel de ingresos, ahorros e inversiones te harían sentir seguro, libre y realizado? ¿Qué pasos concretos podrías dar para acercarte a esa visión?',
  },
  'entorno_y_estilo_de_vida': {
    score_label: 'Cómo calificarías este Dominio?',
    pregunta_estado: '¿Cómo describirías tu entorno actual (hogar, comunidad, relaciones, etc.)? ¿Cuáles son los aspectos que más te nutren y apoyan tu bienestar, y cuáles son los que necesitan mejoras?',
    pregunta_patron: '¿Qué tan alineado está tu estilo de vida actual con tus valores y prioridades personales? ¿Qué cambios te gustaría hacer para que tu día a día refleje mejor lo que realmente te importa?',
    pregunta_necesita: 'Imagina tu entorno y estilo de vida ideales. ¿Cómo sería tu hogar, tus relaciones, tus rutinas y actividades? ¿Qué pasos concretos podrías dar para ir acercándote a esa visión?',
  },
};

export default function DomainCard({ domain, slug, values, onChange }) {
  const { esReadonly } = useFormContext();
  const preguntas = PREGUNTAS_POR_DOMINIO[slug] || {
    score_label: 'En una escala del 1 al 10, ¿cómo está hoy este dominio?',
    pregunta_estado: '¿Cómo está hoy, concretamente?',
    pregunta_patron: '¿Qué patrón tuyo se repite en este dominio?',
    pregunta_necesita: '¿Qué necesita atención, orden o corrección?',
  };

  return (
    <div className="domain-card">
      <h3>{domain}</h3>
      <div className="question">
        <div className="question-header">
          <div className="question-title">
            {preguntas.score_label}
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
        label={preguntas.pregunta_estado}
        value={values[`${slug}_estado`]}
        onChange={onChange}
        disabled={esReadonly}
      />
      <TextArea
        name={`${slug}_patron`}
        label={preguntas.pregunta_patron}
        value={values[`${slug}_patron`]}
        onChange={onChange}
        disabled={esReadonly}
      />
      <TextArea
        name={`${slug}_necesita`}
        label={preguntas.pregunta_necesita}
        value={values[`${slug}_necesita`]}
        onChange={onChange}
        disabled={esReadonly}
      />
    </div>
  );
}
