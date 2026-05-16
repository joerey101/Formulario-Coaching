import React from 'react';
import { useForm } from '../../context/FormContext';
import TextArea from '../ui/TextArea';
import ScaleInput from '../ui/ScaleInput';

export default function Seccion5() {
  const { state, setRespuesta, esReadonly } = useForm();

  const handleChange = (name, value) => {
    setRespuesta(name, value);
  };

  return (
    <>
      <div className="question">
        <div className="question-header">
          <div className="question-title">Capacidad de poner límites</div>
          <span className="tag">Escala 1-10</span>
        </div>
        <ScaleInput 
          name="limites_personales_score" 
          value={state.respuestas.limites_personales_score || ''} 
          onChange={handleChange} 
          disabled={esReadonly}
        />
      </div>
      <TextArea 
        name="limites_donde" 
        label="¿En qué área te cuesta más poner límites?" 
        value={state.respuestas.limites_donde} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
      <TextArea 
        name="limites_costo" 
        label="¿Cuál es el costo de no poner esos límites?" 
        value={state.respuestas.limites_costo} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
      <div className="question">
        <div className="question-header">
          <div className="question-title">Nivel de Autocompasión</div>
          <span className="tag">Escala 1-10</span>
        </div>
        <ScaleInput 
          name="autocompasion_score" 
          value={state.respuestas.autocompasion_score || ''} 
          onChange={handleChange} 
          disabled={esReadonly}
        />
      </div>
      <TextArea 
        name="amor_propio" 
        label="¿Cómo practicás el amor propio concretamente?" 
        value={state.respuestas.amor_propio} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
      <div className="meta-grid">
        <TextArea name="perdon_propio" label="¿Qué necesitás perdonarte?" value={state.respuestas.perdon_propio} onChange={handleChange} disabled={esReadonly} />
        <TextArea name="perdon_otros" label="¿A quién necesitás perdonar?" value={state.respuestas.perdon_otros} onChange={handleChange} disabled={esReadonly} />
      </div>
      <TextArea 
        name="expresion_sentimientos" 
        label="¿Qué tan fácil te resulta expresar lo que sentís?" 
        value={state.respuestas.expresion_sentimientos} 
        onChange={handleChange} 
        disabled={esReadonly}
      />
    </>
  );
}
